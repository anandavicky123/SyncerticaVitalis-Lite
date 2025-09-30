import { ApolloServer } from '@apollo/server'
import { MongoClient } from 'mongodb'
import { GoogleGenerativeAI } from '@google/generative-ai'

const typeDefs = `#graphql
  type DiagnosisCandidate { 
    diagnosis: String! 
    confidence: Float!
    urgency_level: String
  }
  
  type SymptomCheckResult {
    diagnosis: String
    drugs: [String]
    urgency_level: String
    confidence: Float
    candidates: [DiagnosisCandidate]
    recommended_questions: [String]
    lifestyle_guidance: [String]
  }
  
  type ChatMessage {
    sender: String!
    text: String!
    timestamp: String!
  }
  
  type FollowUpInfo {
    hasFollowUp: Boolean!
    questions: [String]
  }
  
  type ChatAnalysisResult {
    response: String!
    diagnosis: SymptomCheckResult
    followUp: FollowUpInfo
  }
  
  type ConversationDiagnosis {
    conditions: [DiagnosisCandidate]
    medications: [String]
    lifestyle: [String]
  }
  
  type ConversationData {
    messages: [ChatMessage]
    diagnosis: ConversationDiagnosis
  }
  
  type ChatConversation {
    id: ID!
    userId: String!
    conversation: ConversationData!
    timestamp: String!
  }
  
  type EHRRecord {
    id: ID!
    userId: String!
    symptoms: String!
    result: SymptomCheckResult!
    timestamp: String!
  }
  
  type Query {
    getEHRRecords(userId: String!): [EHRRecord!]!
    searchEHRRecords(userId: String!, query: String!): [EHRRecord!]!
    getChatConversations(userId: String!): [ChatConversation!]!
  }
  
  type Mutation {
    checkSymptoms(symptoms: String!): SymptomCheckResult!
    saveEHRRecord(userId: String!, symptoms: String!, result: String!): EHRRecord!
    getChatAnalysis(message: String!, context: String!): ChatAnalysisResult!
    resetChat(userId: String!): ChatAnalysisResult!
    saveChatConversation(userId: String!, conversationData: String!): ChatConversation!
  }
`

interface AIModel {
  generateContent: (prompt: string) => Promise<{
    response: {
      text: () => string;
    };
  }>;
}

interface DatabaseConnection {
  collection: (name: string) => {
    find: (filter?: Record<string, unknown>) => {
      sort: (sort: Record<string, unknown>) => {
        toArray: () => Promise<Record<string, unknown>[]>
      }
      toArray: () => Promise<Record<string, unknown>[]>
    }
    aggregate: (pipeline: Record<string, unknown>[]) => {
      toArray: () => Promise<Record<string, unknown>[]>
    }
    insertOne: (doc: Record<string, unknown>) => Promise<{ insertedId: { toString: () => string } }>
  }
}

let db: DatabaseConnection | null = null
async function connectMongoDB(): Promise<DatabaseConnection> {
  if (db) return db
  const uri = process.env.MONGO_URI as string
  const client = new MongoClient(uri)
  await client.connect()
  db = client.db('ehr') as unknown as DatabaseConnection
  return db
}

// Initialize AI model with error handling
async function initializeAI() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    
    // Try the new Gemini 2.0 Flash model first, then fallbacks
    const modelNames = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro'
    ]
    
    // Prefer a single model (configurable) to avoid multiple probe calls that consume quota
    const preferred = process.env.GEMINI_MODEL || modelNames[0]
    try {
      console.log(`Initializing generative model: ${preferred}`)
      const testModel = genAI.getGenerativeModel({ model: preferred })
      return testModel
    } catch (err) {
      console.warn('Preferred model failed to initialize, attempting fallback list without probing:', err)
      // Try fallback models but do NOT call generateContent during startup to avoid consuming quota
      for (const modelName of modelNames) {
        try {
          console.log(`Attempting to obtain model instance: ${modelName}`)
          const inst = genAI.getGenerativeModel({ model: modelName })
          return inst
        } catch (e) {
          console.log(`Model ${modelName} instance creation failed:`, e instanceof Error ? e.message : String(e))
          continue
        }
      }
        }

    console.error('All AI models failed to initialize')
    return null
  } catch (error) {
    console.error('Failed to initialize Google AI:', error)
    return null
  }
}

// Initialize the model
let model: AIModel | null = null
initializeAI().then(m => {
  model = m as AIModel | null
  if (model) {
    console.log('AI model ready')
  } else {
    console.warn('AI model not available - using fallback responses')
  }
})

// Helper to call model.generateContent with retry/backoff for 429s
const callModelGenerate = async (prompt: string, maxRetries = 3) => {
  if (!model) throw new Error('AI model not initialized')

  let attempt = 0
  let backoff = 500 // ms
  while (attempt <= maxRetries) {
    try {
      const res = await (model as any).generateContent(prompt)
      return res
    } catch (err) {
      // dynamic error inspection - allow narrow use of any here
      // @ts-expect-error - runtime error object shape varies by SDK
      const _err: any = err
      attempt++
      // Try to parse rate limit info if available
      // safe access helpers
      const status = _err && (_err.status || _err.response?.status || _err.code)
      const retryAfter = _err && (_err.response?.headers?.['retry-after'] || _err.headers?.['retry-after'])
      if (status === 429 || String(status) === '429') {
        let waitMs = backoff
        if (retryAfter) {
          const ra = parseInt(retryAfter, 10)
          if (!Number.isNaN(ra)) waitMs = ra * 1000
        }
        console.warn(`AI rate limited (429). Retrying in ${waitMs}ms (attempt ${attempt}/${maxRetries})`)
        await new Promise(r => setTimeout(r, waitMs))
        backoff *= 2
        continue
      }

      // For other errors, rethrow to let caller fallback
      throw err
    }
  }
  throw new Error('Exceeded AI retry attempts')
}

const resolvers = {
  Query: {
    getEHRRecords: async (_: unknown, { userId }: { userId: string }) => {
      const database = await connectMongoDB()
      const collection = database.collection('ehr')
      const records = await collection.find({ userId }).sort({ timestamp: -1 }).toArray()
      console.log(`Loaded ${records.length} EHR records for user ${userId}`);
      return records.map((r: Record<string, unknown>) => ({ ...r, id: r._id?.toString() }))
    },
    searchEHRRecords: async (_: unknown, { userId, query }: { userId: string, query: string }) => {
      const database = await connectMongoDB()
      const collection = database.collection('ehr')
      const results = await collection.aggregate([
        { $search: { index: 'default', text: { query, path: ['symptoms', 'result.diagnosis'] } } },
        { $match: { userId } },
        { $sort: { timestamp: -1 } }
      ]).toArray()
      return results.map((r: Record<string, unknown>) => ({ ...r, id: r._id?.toString() }))
    },
    getChatConversations: async (_: unknown, { userId }: { userId: string }) => {
      const database = await connectMongoDB()
      const collection = database.collection('chat_conversations')
      const conversations = await collection.find({ userId }).sort({ timestamp: -1 }).toArray()
      return conversations.map((c: Record<string, unknown>) => ({ ...c, id: c._id?.toString() }))
    }
  },
  Mutation: {
    checkSymptoms: async (_: unknown, { symptoms }: { symptoms: string }) => {
      if (!model) {
        // Fallback response when AI is not available
        return {
          candidates: [
            { diagnosis: "General symptoms", confidence: 0.6, urgency_level: "moderate" },
            { diagnosis: "Common condition", confidence: 0.4, urgency_level: "low" }
          ]
        }
      }
      
      const prompt = `
You are a medical assistant.
The user will describe their symptoms.

If the symptoms are vague/common, return ONLY JSON:
{
  "candidates": [
    { "diagnosis": "Most likely condition", "confidence": 0.65, "urgency_level": "moderate" },
    { "diagnosis": "Second possibility", "confidence": 0.55, "urgency_level": "low" },
    { "diagnosis": "Third possibility", "confidence": 0.42, "urgency_level": "low" }
  ],
  
}

If specific enough for a confident diagnosis (>=0.70), return ONLY JSON:
{
  "diagnosis": "Primary diagnosis name",
  "drugs": ["Medicine 1", "Medicine 2"],
  "urgency_level": "low|moderate|high",
  "confidence": 0.78,
  "lifestyle_guidance": ["Rest and hydration", "Monitor symptoms"]
}

Symptoms: "${symptoms}"
Return ONLY valid JSON.`
  const result = await callModelGenerate(prompt)
  const text = result.response?.text ? result.response.text() : String(result)
      try {
        return JSON.parse(text)
      } catch {
        throw new Error('Failed to parse AI response')
      }
    },
    
    getChatAnalysis: async (_: unknown, { message, context }: { message: string, context: string }) => {
      console.log('getChatAnalysis called with:', { message, context });
      
      // Try to use AI first if available
      if (model) {
        try {
          console.log('Using AI model for analysis');
          const analysisPrompt = `You are a medical assistant AI. A patient says: "${message}"

Previous conversation context: ${context || 'None'}

Analyze the symptoms and respond with JSON in this exact format:

For vague/common symptoms (like just "headache" or "fever"), return:
{
  "response": "Your empathetic conversational response asking for more details",
  "diagnosis": {
    "candidates": [
      { "diagnosis": "Most likely condition", "confidence": 0.65, "urgency_level": "moderate" },
      { "diagnosis": "Second possibility", "confidence": 0.55, "urgency_level": "low" },
      { "diagnosis": "Third possibility", "confidence": 0.42, "urgency_level": "low" }
    ],
    "drugs": ["Over-the-counter pain relief", "Hydration support", "General symptom relief"],
    "lifestyle_guidance": ["Rest and monitor symptoms", "Stay hydrated", "Seek medical attention if symptoms worsen"]
  }
}

For specific symptoms with enough detail for confident diagnosis (confidence >= 0.70), return:
{
  "response": "Your professional medical assessment response",
  "diagnosis": {
    "candidates": [{ "diagnosis": "Primary diagnosis", "confidence": 0.78, "urgency_level": "moderate" }],
    "drugs": ["Paracetamol", "Oral Rehydration Salts (ORS)", "Antiemetic (e.g., Ondansetron)"],
    "urgency_level": "low|moderate|high",
    "lifestyle_guidance": ["Rest and hydration", "Monitor symptoms", "Avoid solid foods initially"]
  }
}

Return ONLY valid JSON, no markdown or other text.`;

          const result = await callModelGenerate(analysisPrompt);
          const text = result.response?.text ? result.response.text() : String(result);
          console.log('[' + new Date().toLocaleTimeString() + '] AI response received:', text);
          
          try {
            // Extract JSON from markdown code blocks if present
            let jsonText = text;
            const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
              jsonText = jsonMatch[1];
              console.log('[' + new Date().toLocaleTimeString() + '] Extracted JSON from markdown:', jsonText);
            }
            
            const analysis = JSON.parse(jsonText);
            console.log('[' + new Date().toLocaleTimeString() + '] Successfully parsed AI response');
            
            // Ensure the response has the correct structure
            if (analysis && typeof analysis === 'object') {
              // Make sure diagnosis object exists
              if (!analysis.diagnosis) {
                analysis.diagnosis = {};
              }
              
              // ensure diagnosis struct exists; we removed recommended_questions usage
              
              console.log('[' + new Date().toLocaleTimeString() + '] Final analysis structure:', JSON.stringify(analysis, null, 2));
            }
            
            return analysis;
          } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
            console.warn('[' + new Date().toLocaleTimeString() + '] Failed to parse AI JSON, using fallback:', errorMessage);
            // Fall through to keyword-based fallback
          }
        } catch (aiError) {
          console.warn('AI model failed, using fallback:', aiError);
          // Fall through to keyword-based fallback
        }
      }
      
      // Keyword-based fallback analysis
      console.log('Using keyword-based fallback analysis');
      const lowerMessage = message.toLowerCase()
      
      let response = "I understand your concern. Let me help you analyze this symptom."
      let candidates = []
      let drugs = []
      let lifestyle = []
      
      // Simple keyword-based analysis
      if (lowerMessage.includes('dizzy') || lowerMessage.includes('dizziness')) {
        response = "Dizziness can have several causes. Let me help you understand what might be causing this."
        candidates = [
          { diagnosis: "Vertigo", confidence: 0.7, urgency_level: "moderate" },
          { diagnosis: "Low blood pressure", confidence: 0.6, urgency_level: "moderate" },
          { diagnosis: "Dehydration", confidence: 0.5, urgency_level: "low" },
          { diagnosis: "Inner ear problem", confidence: 0.4, urgency_level: "low" }
        ]
        drugs = ["Meclizine (for motion sickness)", "Antihistamines", "Stay hydrated"]
        lifestyle = ["Avoid sudden movements", "Sit when feeling dizzy", "Stay hydrated", "Get adequate rest"]
        
      } else if (lowerMessage.includes('headache') || lowerMessage.includes('head')) {
        response = "Headaches are common but can have various causes. Let me analyze your symptoms."
        candidates = [
          { diagnosis: "Tension headache", confidence: 0.8, urgency_level: "low" },
          { diagnosis: "Migraine", confidence: 0.6, urgency_level: "moderate" },
          { diagnosis: "Cluster headache", confidence: 0.3, urgency_level: "high" }
        ]
        drugs = ["Ibuprofen", "Acetaminophen", "Rest in dark room"]
        lifestyle = ["Manage stress", "Regular sleep schedule", "Stay hydrated", "Avoid triggers"]
        
      } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        response = "Fever indicates your body is fighting an infection. Let me help assess this."
        candidates = [
          { diagnosis: "Viral infection", confidence: 0.7, urgency_level: "moderate" },
          { diagnosis: "Bacterial infection", confidence: 0.5, urgency_level: "high" },
          { diagnosis: "Flu", confidence: 0.6, urgency_level: "moderate" }
        ]
        drugs = ["Acetaminophen", "Ibuprofen", "Plenty of fluids"]
        lifestyle = ["Rest", "Stay hydrated", "Monitor temperature", "Isolate if contagious"]
        
      } else if (lowerMessage.includes('cough') || lowerMessage.includes('throat')) {
        response = "Respiratory symptoms can indicate various conditions. Let me analyze this."
        candidates = [
          { diagnosis: "Upper respiratory infection", confidence: 0.7, urgency_level: "moderate" },
          { diagnosis: "Common cold", confidence: 0.8, urgency_level: "low" },
          { diagnosis: "Allergies", confidence: 0.4, urgency_level: "low" }
        ]
        drugs = ["Cough suppressant", "Throat lozenges", "Warm salt water gargle"]
        lifestyle = ["Rest", "Humidity", "Warm fluids", "Avoid irritants"]
        
      } else if (lowerMessage.includes('nausea') || lowerMessage.includes('vomit')) {
        response = "Nausea can be caused by various factors. Let me help identify the possible causes."
        candidates = [
          { diagnosis: "Gastroenteritis", confidence: 0.7, urgency_level: "moderate" },
          { diagnosis: "Food poisoning", confidence: 0.6, urgency_level: "high" },
          { diagnosis: "Motion sickness", confidence: 0.4, urgency_level: "low" }
        ]
        drugs = ["Anti-nausea medication", "Electrolyte solutions", "Ginger"]
        lifestyle = ["BRAT diet", "Small frequent meals", "Stay hydrated", "Rest"]
        
      } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        response = "Pain can indicate various conditions. Can you tell me more about the location and type of pain?"
        candidates = [
          { diagnosis: "Musculoskeletal pain", confidence: 0.6, urgency_level: "low" },
          { diagnosis: "Inflammatory condition", confidence: 0.5, urgency_level: "moderate" }
        ]
        drugs = ["Pain relievers (NSAIDs)", "Rest", "Ice/heat therapy"]
        lifestyle = ["Gentle movement", "Proper posture", "Stress management"]
        
      } else {
        response = "Thank you for sharing your symptoms. Can you provide more specific details about what you're experiencing?"
        candidates = [
          { diagnosis: "General symptoms assessment needed", confidence: 0.5, urgency_level: "low" }
        ]
        drugs = ["Consult healthcare provider"]
        lifestyle = ["Monitor symptoms", "Rest", "Stay hydrated"]
        
      }
      
      return {
        response,
        diagnosis: {
          candidates,
          drugs,
          lifestyle_guidance: lifestyle
        },
        followUp: {
          hasFollowUp: true,
          questions: []
        }
      }
    },

    resetChat: async (_: unknown, { userId }: { userId: string }) => {
      console.log('resetChat called for user:', userId);

      // Try to let the AI produce a friendly reset greeting if available
      if (model) {
        try {
          const prompt = `You are a medical assistant. The user wants to start a new chat and reset the context. Respond with a short friendly greeting asking what symptoms they have. Return only plain text (no JSON).`;
          const result = await callModelGenerate(prompt);
          const text = result.response?.text ? result.response.text() : String(result);
          console.log('AI resetChat response:', text);
          return {
            response: text,
            diagnosis: {
              candidates: [],
              drugs: ["Stay hydrated", "Rest when needed", "Monitor symptoms"],
              lifestyle_guidance: ["Maintain a healthy diet", "Get adequate sleep", "Stay physically active", "Practice stress management"],
              recommended_questions: []
            },
            followUp: {
              hasFollowUp: true,
              questions: ["What specific symptoms are you experiencing?", "How long have you had these symptoms?", "Have you tried any treatments so far?"]
            }
          };
        } catch (err) {
          console.warn('AI failed to generate reset greeting, falling back', err);
        }
      }

      // Fallback static greeting
      return {
        response: "Hello! I'm your AI health assistant. What symptoms are you experiencing today? I'm here to help you understand your symptoms and provide recommendations for care.",
        diagnosis: {
          candidates: [],
          drugs: ["Stay hydrated", "Rest when needed", "Monitor symptoms"],
          lifestyle_guidance: ["Maintain a healthy diet", "Get adequate sleep", "Stay physically active", "Practice stress management"],
          recommended_questions: []
        },
        followUp: {
          hasFollowUp: true,
          questions: ["What specific symptoms are you experiencing?", "How long have you had these symptoms?", "Have you tried any treatments so far?"]
        }
      };
    },

    saveChatConversation: async (_: unknown, { userId, conversationData }: { userId: string, conversationData: string }) => {
      const database = await connectMongoDB()
      const collection = database.collection('chat_conversations')
      const conversation = { 
        userId, 
        conversation: JSON.parse(conversationData), 
        timestamp: new Date().toISOString() 
      }
      const insert = await collection.insertOne(conversation)
      console.log(`Saved chat conversation for user ${userId}`);
      return { id: insert.insertedId.toString(), ...conversation }
    },

    saveEHRRecord: async (_: unknown, { userId, symptoms, result }: { userId: string, symptoms: string, result: string }) => {
      // Validate userId is provided and not empty
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided')
      }
      
      const database = await connectMongoDB()
      const collection = database.collection('ehr')
      
      // Parse and validate result data
      let parsedResult
      try {
        parsedResult = JSON.parse(result)
      } catch {
        throw new Error('Invalid result data format')
      }
      
      // Create record with strict userId association
      const record = { 
        userId: userId.trim(), 
        symptoms: symptoms || 'Health Assessment', 
        result: parsedResult, 
        timestamp: new Date().toISOString() 
      }
      
      const insert = await collection.insertOne(record)
      
      console.log(`Saved EHR record for user ${userId}`);
      
      return { id: insert.insertedId.toString(), ...record }
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string; variables?: Record<string, unknown> }>(event)
  if (!body?.query) return { errors: [{ message: 'No query provided' }] }
  const result = await server.executeOperation({ query: body.query, variables: body.variables })
  return result
})