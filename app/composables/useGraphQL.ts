interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: { message: string }[];
}

export const useGraphQL = () => {
  const graphqlRequest = async (query: string, variables = {}) => {
    try {
      console.log('Making GraphQL request:', { query: query.substring(0, 100) + '...', variables });
      
      const response = await $fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          query,
          variables,
        },
      }) as GraphQLResponse;
      
      console.log('GraphQL RAW response received:', JSON.stringify(response, null, 2));
      
      if (response.errors && response.errors.length > 0) {
        // If errors exist but data is present, log the errors and return the data so UI can try to use partial results.
        console.warn('GraphQL returned errors but also data. Errors:', response.errors);
        if (response.data) {
          return response.data;
        }
        // No data available - throw the first error
        throw new Error(response.errors[0]?.message || 'GraphQL error occurred');
      }

      // Return the data directly, not wrapped
      return response.data || response;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  };

  // Symptom checker query
  const checkSymptoms = async (symptoms: string) => {
    const query = `
      mutation CheckSymptoms($symptoms: String!) {
        checkSymptoms(symptoms: $symptoms) {
          diagnosis
          drugs
          urgency_level
          confidence
          candidates {
              diagnosis
              confidence
              urgency_level
          }
          
        }
      }
    `;
    
    return await graphqlRequest(query, { symptoms });
  };

  // Save EHR record
  const saveEHRRecord = async (userId: string, symptoms: string, result: Record<string, unknown>) => {
    const query = `
      mutation SaveEHRRecord($userId: String!, $symptoms: String!, $result: String!) {
        saveEHRRecord(userId: $userId, symptoms: $symptoms, result: $result) {
          id
          userId
          symptoms
          result {
            diagnosis
            drugs
            urgency_level
            confidence
          }
          timestamp
        }
      }
    `;
    
    return await graphqlRequest(query, { 
      userId, 
      symptoms, 
      result: JSON.stringify(result) 
    });
  };

  // Get EHR records
  const getEHRRecords = async (userId: string) => {
    const query = `
      query GetEHRRecords($userId: String!) {
        getEHRRecords(userId: $userId) {
          id
          userId
          symptoms
          result {
            diagnosis
            drugs
            urgency_level
            confidence
            candidates {
              diagnosis
              confidence
              urgency_level
            }
          }
          timestamp
        }
      }
    `;
    
    return await graphqlRequest(query, { userId });
  };

  // Search EHR records
  const searchEHRRecords = async (userId: string, searchQuery: string) => {
    const query = `
      query SearchEHRRecords($userId: String!, $query: String!) {
        searchEHRRecords(userId: $userId, query: $query) {
          id
          userId
          symptoms
          result {
            diagnosis
            drugs
            urgency_level
            confidence
          }
          timestamp
        }
      }
    `;
    
    return await graphqlRequest(query, { userId, query: searchQuery });
  };

  // Chat analysis query  
  const getChatAnalysis = async (message: string, conversationContext: string) => {
    console.log('GraphQL getChatAnalysis called with:', { message, conversationContext });
    
    const query = `
      mutation GetChatAnalysis($message: String!, $context: String!) {
        getChatAnalysis(message: $message, context: $context) {
          response
          diagnosis {
            diagnosis
            drugs
            urgency_level
            confidence
            candidates {
                diagnosis
                confidence
                urgency_level
            }
            lifestyle_guidance
            
          }
          followUp {
            hasFollowUp
            questions
          }
        }
      }
    `;
    
    const result = await graphqlRequest(query, { message, context: conversationContext });
    console.log('GraphQL getChatAnalysis RAW result:', JSON.stringify(result, null, 2));

    // Handle various nested response structures we might receive from Nuxt/GraphQL
    // Check for deeply nested structures first
    const asRecord = result as Record<string, unknown>;
    
    // Check for body.singleResult.data.getChatAnalysis (full Nuxt response structure)
    const body = asRecord.body as Record<string, unknown>;
    if (body?.singleResult) {
      const singleResult = body.singleResult as Record<string, unknown>;
      if (singleResult?.data) {
        const data = singleResult.data as Record<string, unknown>;
        if (data?.getChatAnalysis) {
          console.log('GraphQL returned body.singleResult.data.getChatAnalysis');
          return data.getChatAnalysis as Record<string, unknown>;
        }
      }
    }
    
    // Check for standard GraphQL response shapes
    if (asRecord.getChatAnalysis) {
      console.log('GraphQL returned top-level getChatAnalysis');
      return asRecord.getChatAnalysis as Record<string, unknown>;
    }

    if ((asRecord.data as Record<string, unknown>)?.getChatAnalysis) {
      console.log('GraphQL returned data.getChatAnalysis');
      return (asRecord.data as Record<string, unknown>).getChatAnalysis as Record<string, unknown>;
    }

    // Fallback - return whatever we have (could already be the analysis object)
    console.log('GraphQL returning raw result as analysis object');
    return result as Record<string, unknown>;
  };

  // Save chat conversation
  const saveChatConversation = async (userId: string, conversationData: Record<string, unknown>) => {
    const query = `
      mutation SaveChatConversation($userId: String!, $conversationData: String!) {
        saveChatConversation(userId: $userId, conversationData: $conversationData) {
          id
          userId
          conversation {
            messages {
              sender
              text
              timestamp
            }
            diagnosis {
              conditions {
                diagnosis
                confidence
              }
              medications
              lifestyle
            }
          }
          timestamp
        }
      }
    `;
    
    return await graphqlRequest(query, { 
      userId, 
      conversationData: JSON.stringify(conversationData) 
    });
  };

  // Get chat conversations for a user
  const getChatConversations = async (userId: string) => {
    const query = `
      query GetChatConversations($userId: String!) {
        getChatConversations(userId: $userId) {
          id
          userId
          conversation {
            messages {
              sender
              text
              timestamp
            }
            diagnosis {
              conditions {
                diagnosis
                confidence
              }
              medications
              lifestyle
            }
          }
          timestamp
        }
      }
    `;
    
    return await graphqlRequest(query, { userId });
  };

  // Reset chat (start a new conversation) - returns a friendly AI greeting and empty diagnosis
  const resetChat = async (userId: string) => {
    const query = `
      mutation ResetChat($userId: String!) {
        resetChat(userId: $userId) {
          response
          diagnosis {
            candidates { diagnosis confidence }
            drugs
            lifestyle_guidance
            
          }
          followUp { hasFollowUp questions }
        }
      }
    `;

    return await graphqlRequest(query, { userId });
  };

  return {
    graphqlRequest,
    checkSymptoms,
    saveEHRRecord,
    getEHRRecords,
    searchEHRRecords,
    getChatAnalysis,
    saveChatConversation,
    getChatConversations,
    resetChat
  };
};