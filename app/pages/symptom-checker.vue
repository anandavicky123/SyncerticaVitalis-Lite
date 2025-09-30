<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-blue-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-blue-900">
              Syncertica Vitalis Lite
            </NuxtLink>
          </div>
          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </NuxtLink>
            <NuxtLink to="/symptom-checker" class="text-blue-600 px-3 py-2 rounded-md text-sm font-medium bg-blue-50">
              Symptom Checker
            </NuxtLink>
            <NuxtLink to="/ehr" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              EHR Records
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Doctor Chat</h1>
        <p class="text-gray-600">Chat with our AI doctor about your symptoms</p>
      </div>

      <!-- Chat Interface Layout -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Chat Section -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Chat Header -->
            <div class="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Dr. AI Assistant</h3>
                  <p class="text-sm opacity-90">Online - Ready to help</p>
                </div>
                <div class="ml-auto">
                    <div class="flex items-center space-x-3">
                      <button
                        class="text-white text-sm opacity-80 hover:opacity-100"
                        @click="_debugPanel = !_debugPanel"
                      >
                        Debug
                      </button>
                      <button
                        class="text-sm bg-transparent border border-white/30 hover:border-white/50 text-white px-3 py-2 rounded-md font-medium min-w-[80px] flex items-center justify-center"
                        :disabled="isAnalyzing || isSaving"
                        title="Start a new chat and reset AI context"
                        @click="startNewChat"
                      >
                        New Chat
                      </button>
                    </div>
                </div>
              </div>
            </div>

            <!-- Chat Messages -->
            <div ref="chatContainer" class="h-96 overflow-y-auto p-4 bg-gray-50">
              <!-- Initial AI Message -->
              <div v-if="chatMessages.length === 0" class="mb-4">
                <div class="flex items-start">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="bg-blue-100 rounded-xl rounded-tl-none p-4 max-w-xs">
                    <p class="text-blue-800">Hello! I'm your AI health assistant. What symptoms are you experiencing today?</p>
                  </div>
                </div>
              </div>

              <!-- Chat Messages -->
              <div v-for="(message, index) in chatMessages" :key="index" class="mb-4">
                <!-- AI Messages -->
                <div v-if="message.sender === 'ai'" class="flex items-start">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="bg-blue-100 rounded-xl rounded-tl-none p-4 max-w-md">
                    <p class="text-blue-800">{{ message.text }}</p>
                    <span class="text-xs text-blue-600 opacity-75">{{ formatTime(message.timestamp) }}</span>
                  </div>
                </div>

                <!-- User Messages -->
                <div v-else class="flex items-start justify-end">
                  <div class="bg-gray-200 rounded-xl rounded-tr-none p-4 max-w-md mr-3">
                    <p class="text-gray-800">{{ message.text }}</p>
                    <span class="text-xs text-gray-600 opacity-75">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isTyping" class="mb-4">
                <div class="flex items-start">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="bg-blue-100 rounded-xl rounded-tl-none p-4">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s" />
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="p-4 border-t border-gray-200">
              <form class="flex space-x-2" @submit.prevent="sendMessage">
                <input
                  v-model="currentMessage"
                  type="text"
                  placeholder="Describe your symptoms..."
                  class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="isTyping"
                >
                <button
                  type="submit"
                  :disabled="!currentMessage.trim() || isTyping"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.429a1 1 0 001.17-1.409l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Diagnosis Possibilities Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Health Assessment</h3>
            
            <!-- Loading State -->
            <div v-if="isAnalyzing && possibleConditions.length === 0" class="text-center py-8">
              <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p class="text-gray-600">Analyzing symptoms...</p>
            </div>

            <!-- No Analysis Yet -->
            <div v-else-if="possibleConditions.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-gray-600">Start chatting to see possible conditions</p>
            </div>

            <!-- Possible Conditions -->
            <div v-else class="space-y-4 mb-6">
              <h4 class="font-semibold text-blue-700 mb-3">Possible Conditions</h4>
              <div v-for="condition in possibleConditions" :key="condition.diagnosis" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-800">{{ condition.diagnosis }}</span>
                    <span v-if="condition.urgency_level" :class="_getUrgencyLevelClass(condition.urgency_level)" class="text-xs font-semibold px-2 py-0.5 rounded-full">
                      {{ condition.urgency_level.toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-sm text-blue-600 font-semibold">{{ Math.round(condition.confidence * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    :style="`width: ${condition.confidence * 100}%`"
                  />
                </div>
              </div>
            </div>

            <!-- Recommended Medications -->
            <div v-if="recommendedMedications.length > 0" class="mb-6">
              <h4 class="font-semibold text-green-700 mb-3">Recommended Medications</h4>
              <ul class="space-y-2">
                <li v-for="medication in recommendedMedications" :key="medication" class="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon class="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {{ medication }}
                </li>
              </ul>
            </div>

            <!-- Lifestyle Guidance -->
            <div v-if="lifestyleGuidance.length > 0" class="mb-6">
              <h4 class="font-semibold text-purple-700 mb-3">Lifestyle Guidance</h4>
              <ul class="space-y-2">
                <li v-for="guidance in lifestyleGuidance" :key="guidance" class="flex items-center text-sm text-gray-700">
                  <CheckCircleIcon class="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                  {{ guidance }}
                </li>
              </ul>
            </div>

            <!-- Recommended Follow-up Questions -->
            <div v-if="recommendedQuestions.length > 0" class="mb-6">
              <h4 class="font-semibold text-amber-700 mb-3">For Better Diagnosis</h4>
              <p class="text-xs text-gray-600 mb-3">Please answer these questions for more accurate assessment:</p>
              <div class="space-y-2">
                <button
                  v-for="question in recommendedQuestions"
                  :key="question"
                  class="w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 transition-colors"
                  @click="askFollowUpQuestion(question)"
                >
                  <svg class="w-4 h-4 text-amber-600 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                  </svg>
                  {{ question }}
                </button>
              </div>
            </div>

            <!-- Save Result Button -->
            <div v-if="possibleConditions.length > 0" class="space-y-3">
              <button
                :disabled="isSaving"
                class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200"
                @click="saveConversation"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ isSaving ? 'Saving Health Assessment...' : 'Save Health Assessment' }}
              </button>
              
              <NuxtLink
                to="/ehr"
                class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 text-center block"
              >
                View Medical Records
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message (moved to floating toast to ensure visibility) -->

      <!-- Debug Panel -->
      <div v-if="_debugPanel" class="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
        <h3 class="text-white mb-2">Debug Information</h3>
        <div class="mb-4">
          <strong class="text-yellow-400">Raw GraphQL Result:</strong>
          <pre class="whitespace-pre-wrap mt-1">{{ JSON.stringify(_lastRawResult, null, 2) }}</pre>
        </div>
        <div class="mb-4">
          <strong class="text-yellow-400">Parsed Analysis:</strong>
          <pre class="whitespace-pre-wrap mt-1">{{ JSON.stringify(_lastAnalysis, null, 2) }}</pre>
        </div>
        <div>
          <strong class="text-yellow-400">Current State:</strong>
          <pre class="whitespace-pre-wrap mt-1">{{
            JSON.stringify({
              possibleConditions: possibleConditions,
              recommendedMedications: recommendedMedications,
              lifestyleGuidance: lifestyleGuidance,
              recommendedQuestions: recommendedQuestions
            }, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Floating Success Toast -->
      <div v-if="showSaveSuccess" role="status" aria-live="polite" class="fixed bottom-6 right-6 z-50">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-start space-x-3 w-80">
          <CheckCircleIcon class="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-green-800">Health Assessment Saved!</h3>
            <p class="text-sm text-green-700 mt-1">Your health assessment has been saved to your medical records.</p>
          </div>
          <button @click="dismissSaveSuccess" class="text-green-700 hover:text-green-900 ml-2" aria-label="Dismiss notification">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9.293l4.146-4.147a1 1 0 111.415 1.415L11.414 10.707l4.147 4.146a1 1 0 01-1.415 1.415L10 12.121l-4.146 4.147a1 1 0 01-1.415-1.415L8.586 10.707 4.439 6.56A1 1 0 115.854 5.146L10 9.293z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>

      <!-- Medical Disclaimer -->
      <!-- moved disclaimer to footer area -->
    </main>

    <!-- Footer / Medical Disclaimer (separated from main content) -->
    <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
        <div class="flex">
          <ExclamationTriangleIcon class="h-6 w-6 text-amber-600 mr-3 flex-shrink-0" />
          <div>
            <h3 class="text-sm font-medium text-amber-800">Medical Disclaimer</h3>
            <p class="text-sm text-amber-700 mt-1">
              This AI analysis is for informational purposes only and should not replace professional medical advice.
              Always consult with a qualified healthcare provider for proper diagnosis and treatment.
              In case of emergency, contact your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

// Composables
const { getUserId, initializeUser } = useUserSession();
const { getChatAnalysis, saveEHRRecord, resetChat, getChatConversations } = useGraphQL();

// Reactive state for chat
const chatMessages = ref([]);
const currentMessage = ref('');
const isTyping = ref(false);
const isSaving = ref(false);
const userId = ref('');
const chatContainer = ref(null);

// Reactive state for diagnosis
const possibleConditions = ref([]);
const recommendedMedications = ref([]);
const lifestyleGuidance = ref([]);
const recommendedQuestions = ref([]);
const isAnalyzing = ref(false);
// Debug helpers
const _debugPanel = ref(false);
const _lastRawResult = ref(null);
const _lastAnalysis = ref(null);

// Legacy state for compatibility (unused but kept to prevent build errors)
const _symptoms = ref('');
const _analysisResult = ref(null);
const _showResults = ref(false);
const showSaveSuccess = ref(false);
let _saveSuccessTimeout = null;
const _followUpQuestions = ref([]);
const _followUpAnswers = ref([]);

// Initialize user on mount
onMounted(async () => {
  try {
    await initializeUser();
    userId.value = await getUserId();
    
    // Load persisted chat state first
    loadChatState();
    
    // Then try to load from server if no local state
    if (chatMessages.value.length === 0) {
      await loadChatFromServer();
    }
  } catch (error) {
    console.error('Failed to initialize user session:', error);
  }
});

// Save chat state to localStorage
const saveChatState = () => {
  if (!import.meta.client || !userId.value) return;
  
  const chatState = {
    chatMessages: chatMessages.value,
    possibleConditions: possibleConditions.value,
    recommendedMedications: recommendedMedications.value,
    lifestyleGuidance: lifestyleGuidance.value,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(`chat-state-${userId.value}`, JSON.stringify(chatState));
  } catch (error) {
    console.warn('Failed to save chat state to localStorage:', error);
  }
};

// Load chat state from localStorage
const loadChatState = () => {
  if (!import.meta.client || !userId.value) return;
  
  try {
    const saved = localStorage.getItem(`chat-state-${userId.value}`);
    if (!saved) return;
    
    const chatState = JSON.parse(saved);
    
    // Check if state is not too old (24 hours)
    const age = Date.now() - (chatState.timestamp || 0);
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`chat-state-${userId.value}`);
      return;
    }
    
    // Restore state
    if (Array.isArray(chatState.chatMessages)) {
      chatMessages.value = chatState.chatMessages;
    }
    if (Array.isArray(chatState.possibleConditions)) {
      possibleConditions.value = chatState.possibleConditions;
    }
    if (Array.isArray(chatState.recommendedMedications)) {
      recommendedMedications.value = chatState.recommendedMedications;
    }
    if (Array.isArray(chatState.lifestyleGuidance)) {
      lifestyleGuidance.value = chatState.lifestyleGuidance;
    }
    
    console.log('Loaded chat state from localStorage:', {
      messages: chatMessages.value.length,
      conditions: possibleConditions.value.length
    });
  } catch (error) {
    console.warn('Failed to load chat state from localStorage:', error);
    // Clear invalid state
    localStorage.removeItem(`chat-state-${userId.value}`);
  }
};

// Load chat from server
const loadChatFromServer = async () => {
  // Ensure we have a userId
  if (!userId.value) {
    userId.value = await getUserId();
  }
  
  if (!userId.value) {
    console.warn('Cannot load chat from server: no userId available');
    return;
  }
  
  try {
    const result = await getChatConversations(userId.value);
    console.log('Loaded chat conversations from server:', result);
    
    // Handle the response structure
    let conversations = [];
    if (result && typeof result === 'object') {
      if (Array.isArray(result.getChatConversations)) {
        conversations = result.getChatConversations;
      } else if (result.data && Array.isArray(result.data.getChatConversations)) {
        conversations = result.data.getChatConversations;
      } else if (Array.isArray(result)) {
        conversations = result;
      }
    }
    
    // Load the most recent conversation if available
    if (conversations.length > 0) {
      const latestConversation = conversations[conversations.length - 1];
      if (latestConversation.conversation && latestConversation.conversation.messages) {
        chatMessages.value = latestConversation.conversation.messages;
        
        // Load diagnosis data if available
        const diagnosis = latestConversation.conversation.diagnosis;
        if (diagnosis) {
          if (Array.isArray(diagnosis.conditions)) {
            possibleConditions.value = diagnosis.conditions.map(c => ({
              diagnosis: c.diagnosis,
              confidence: c.confidence,
              urgency_level: c.urgency_level || 'low'
            }));
          }
          if (Array.isArray(diagnosis.medications)) {
            recommendedMedications.value = diagnosis.medications;
          }
          if (Array.isArray(diagnosis.lifestyle)) {
            lifestyleGuidance.value = diagnosis.lifestyle;
          }
        }
        
        console.log('Restored chat from server:', {
          messages: chatMessages.value.length,
          conditions: possibleConditions.value.length
        });
      }
    }
  } catch (error) {
    console.error('Failed to load chat from server:', error);
  }
};

// Send message function
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return;

  const userMessage = {
    sender: 'user',
    text: currentMessage.value.trim(),
    timestamp: new Date().toISOString()
  };

  chatMessages.value.push(userMessage);
  const messageText = currentMessage.value.trim();
  currentMessage.value = '';

  // Scroll to bottom
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });

  // Show typing indicator
  isTyping.value = true;
  isAnalyzing.value = true;

  try {
    // Build conversation context
    const context = chatMessages.value
      .map(msg => `${msg.sender === 'user' ? 'Patient' : 'Doctor'}: ${msg.text}`)
      .join('\n');

    console.log('Sending chat analysis request:', { messageText, context });
    
  // Get AI response and analysis from server
  const result = await getChatAnalysis(messageText, context);
  console.log('Received analysis from server:', result);
  // Store debug info
  _lastRawResult.value = result;

    // `getChatAnalysis` from composable now unwraps the response and returns the analysis object
  const analysis = result || {};

    // Normalize analysis.response to a string so the UI can display it
    let responseText = null;
    try {
      console.log('analysis.response type:', typeof analysis.response);
      if (analysis && analysis.response != null) {
        if (typeof analysis.response === 'string') {
          responseText = analysis.response;
        } else if (typeof analysis.response === 'object') {
          // Sometimes the response might be an object (wrapped or parsed). Try common fields, otherwise stringify.
          if ('text' in analysis.response && typeof analysis.response.text === 'string') {
            responseText = analysis.response.text;
          } else {
            responseText = JSON.stringify(analysis.response);
          }
        } else {
          responseText = String(analysis.response);
        }
      }
    } catch (e) {
      console.warn('Failed to normalize analysis.response:', e);
      responseText = null;
    }

    if (!responseText) {
      console.error('Invalid analysis object received (no usable response):', analysis);
      const errorMessage = {
        sender: 'ai',
        text: 'I received your message but could not analyze it. Please try again.',
        timestamp: new Date().toISOString()
      };
      isTyping.value = false;
      chatMessages.value.push(errorMessage);
      isAnalyzing.value = false;
      return;
    }

  // Save parsed analysis for debugging
  _lastAnalysis.value = analysis;

    // Add AI response to chat
    const aiMessage = {
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toISOString()
    };

    isTyping.value = false;
    chatMessages.value.push(aiMessage);

    // Update diagnosis possibilities if available
    const diag = analysis.diagnosis || {};
    if (diag) {
      console.log('Updating diagnosis from result:', diag);

      // Handle candidates
      const candidates = Array.isArray(diag.candidates) ? diag.candidates : null;
      if (candidates && candidates.length > 0) {
        possibleConditions.value = candidates.map(c => ({
          diagnosis: String(c.diagnosis || 'Unknown'),
          confidence: Number(c.confidence || 0),
          urgency_level: String(c.urgency_level || '').toLowerCase()
        }));
      }

      // Handle medications
      const drugs = Array.isArray(diag.drugs) ? diag.drugs : null;
      if (drugs && drugs.length > 0) recommendedMedications.value = drugs;

      // Handle lifestyle guidance
      const lifestyle = Array.isArray(diag.lifestyle_guidance) ? diag.lifestyle_guidance : null;
      if (lifestyle && lifestyle.length > 0) lifestyleGuidance.value = lifestyle;
      
  // Recommended follow-up questions were removed from server responses; keep local list empty
    }

    // Scroll to bottom after AI response
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
    
    // Save state after successful message
    saveChatState();

  } catch (error) {
    console.error('Chat failed:', error);
    isTyping.value = false;

    // Try to show server-provided message if available
    let serverText = null;
    try {
      // GraphQL client may throw an Error with message or return an object
      if (error && typeof error === 'object') {
        serverText = error['message'] || String(error);
      } else if (typeof error === 'string') {
        serverText = error;
      }
    } catch {
      serverText = null;
    }

    const errorMessage = {
      sender: 'ai',
      text: serverText || 'I apologize, but I encountered an error. Please try again or rephrase your symptoms.',
      timestamp: new Date().toISOString()
    };

    chatMessages.value.push(errorMessage);
  } finally {
    isAnalyzing.value = false;
  }
};

// Save Health Assessment function
const saveConversation = async () => {
  // Ensure we have a userId
  if (!userId.value) {
    userId.value = await getUserId();
  }
  
  if (!userId.value || possibleConditions.value.length === 0) {
    console.warn('Cannot save: missing userId or no conditions to save');
    return;
  }

  isSaving.value = true;
  
  try {
    // Prepare Health Assessment data for EHR
    const symptomsSummary = chatMessages.value
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .join('. ');

    const healthAssessmentData = {
      // Primary diagnosis if confidence >= 70%, otherwise use candidates
      diagnosis: possibleConditions.value.length === 1 && possibleConditions.value[0].confidence >= 0.7 
        ? possibleConditions.value[0].diagnosis 
        : undefined,
      confidence: possibleConditions.value.length === 1 && possibleConditions.value[0].confidence >= 0.7 
        ? possibleConditions.value[0].confidence 
        : undefined,
      urgency_level: possibleConditions.value.length === 1 && possibleConditions.value[0].confidence >= 0.7 
        ? possibleConditions.value[0].urgency_level 
        : undefined,
      candidates: possibleConditions.value,
      drugs: recommendedMedications.value,
      lifestyle_guidance: lifestyleGuidance.value
    };

    // Save Health Assessment to EHR collection
    await saveEHRRecord(userId.value, symptomsSummary || 'Health Assessment', healthAssessmentData);
    
    // Show success message
    showSaveSuccess.value = true;
    // Auto-dismiss after 5 seconds
    if (_saveSuccessTimeout) clearTimeout(_saveSuccessTimeout);
    _saveSuccessTimeout = setTimeout(() => {
      showSaveSuccess.value = false;
      _saveSuccessTimeout = null;
    }, 5000);

  } catch (error) {
    console.error('Failed to save Health Assessment:', error);
    alert('Failed to save Health Assessment. Please try again.');
  } finally {
    isSaving.value = false;
  }
};

// Dismiss handler for the floating toast so users can close early
const dismissSaveSuccess = () => {
  showSaveSuccess.value = false;
  if (_saveSuccessTimeout) {
    clearTimeout(_saveSuccessTimeout);
    _saveSuccessTimeout = null;
  }
};

// Start a new chat: reset local state and notify AI/server
const startNewChat = async () => {
  // Prevent resetting while saving or analyzing
  if (isSaving.value || isAnalyzing.value) return;

  // Clear local UI state
  chatMessages.value = [];
  currentMessage.value = '';
  possibleConditions.value = [];
  recommendedMedications.value = [];
  lifestyleGuidance.value = [];
  recommendedQuestions.value = [];
  showSaveSuccess.value = false;
  
  // Clear localStorage
  if (import.meta.client && userId.value) {
    localStorage.removeItem(`chat-state-${userId.value}`);
  }

  // Notify server/AI to reset context and get initial greeting
  try {
    // Ensure we have a userId
    if (!userId.value) {
      userId.value = await getUserId();
    }
    
    isAnalyzing.value = true;
    const resetResult = await getChatAnalysis ? await resetChat(userId.value) : null;
    const analysis = resetResult || {};

    // Normalize response text
    let responseText = null;
    if (analysis && analysis.response) {
      responseText = typeof analysis.response === 'string' ? analysis.response : JSON.stringify(analysis.response);
    }

    const aiMessage = {
      sender: 'ai',
      text: responseText || "Hello! I'm your AI health assistant. What symptoms are you experiencing today?",
      timestamp: new Date().toISOString()
    };

    chatMessages.value.push(aiMessage);

    // If the server returned diagnosis seeds, apply them
    const diag = analysis.diagnosis || {};
    if (diag) {
      const candidates = Array.isArray(diag.candidates) ? diag.candidates : null;
      if (candidates && candidates.length > 0) {
          possibleConditions.value = candidates.map(c => ({ diagnosis: String(c.diagnosis || 'Unknown'), confidence: Number(c.confidence || 0), urgency_level: String(c.urgency_level || '').toLowerCase() }));
        }

      const drugs = Array.isArray(diag.drugs) ? diag.drugs : null;
      if (drugs && drugs.length > 0) recommendedMedications.value = drugs;

      const lifestyle = Array.isArray(diag.lifestyle_guidance) ? diag.lifestyle_guidance : null;
      if (lifestyle && lifestyle.length > 0) lifestyleGuidance.value = lifestyle;

  // Recommended follow-up questions were removed from server responses; keep local list empty
    }

    // Scroll to bottom
    nextTick(() => {
      if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    });
    
    // Save empty state
    saveChatState();
  } catch (err) {
    console.error('Failed to reset chat:', err);
    // Push fallback AI greeting
    chatMessages.value.push({ sender: 'ai', text: "Hello! I'm your AI health assistant. What symptoms are you experiencing today?", timestamp: new Date().toISOString() });
  } finally {
    isAnalyzing.value = false;
  }
};

// Format time helper
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Handle follow-up questions
const askFollowUpQuestion = (question) => {
  currentMessage.value = question;
  // Clear the recommended questions after selection
  recommendedQuestions.value = [];
};

// Legacy functions for compatibility (unused but kept to avoid errors)
const _analyzeSymptoms = async () => {
  // This is the old function, kept for compatibility
  return;
};

// Legacy functions for compatibility (unused but kept to avoid errors)
const _showFollowUpQuestions = () => {
  // Legacy function for compatibility
  return;
};

const _saveToEHR = async () => {
  // Legacy function for compatibility
  return;
};

const _startOver = () => {
  chatMessages.value = [];
  possibleConditions.value = [];
  recommendedMedications.value = [];
  lifestyleGuidance.value = [];
  recommendedQuestions.value = [];
  currentMessage.value = '';
  showSaveSuccess.value = false;
};

const _getUrgencyClass = (urgency) => {
  const urgencyLower = urgency.toLowerCase();
  if (urgencyLower === 'high') {
    return 'bg-red-100 text-red-800';
  } else if (urgencyLower === 'moderate') {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

// Map urgency level to badge classes
const _getUrgencyLevelClass = (urgency_level) => {
  const s = String(urgency_level || '').toLowerCase();
  if (s === 'high') return 'bg-red-100 text-red-700';
  if (s === 'moderate') return 'bg-yellow-100 text-yellow-800';
  if (s === 'low') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-700';
};

// SEO
useHead({
  title: 'AI Doctor Chat - Syncertica Vitalis Lite',
  meta: [
    {
      name: 'description',
      content: 'Chat with our AI doctor about your symptoms and get real-time diagnosis possibilities and medical guidance.'
    }
  ]
});
</script>

<style scoped>
/* Custom styles if needed */
</style>