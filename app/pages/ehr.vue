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
            <NuxtLink to="/symptom-checker" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Symptom Checker
            </NuxtLink>
            <NuxtLink to="/ehr" class="text-blue-600 px-3 py-2 rounded-md text-sm font-medium bg-blue-50">
              EHR Records
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Electronic Health Records</h1>
        <p class="text-gray-600">Your complete medical history and symptom analysis records</p>
        
        <!-- User ID Display for Debugging -->
        <div v-if="userId" class="mt-3 text-xs text-gray-500 font-mono bg-gray-50 rounded px-2 py-1 inline-block">
          User ID: {{ userId.substring(0, 8) }}...{{ userId.substring(userId.length - 4) }}
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              Search your medical records
            </label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by symptoms, diagnosis, medications..."
              @keyup.enter="performSearch"
            >
          </div>
          <div class="flex space-x-3">
            <button
              :disabled="isSearching"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              @click="performSearch"
            >
              <svg v-if="isSearching" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
            <button
              v-if="searchQuery"
              class="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              @click="clearSearch"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Records Stats -->
      <div v-if="!isLoading && records.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Records</p>
              <p class="text-2xl font-bold text-gray-900">{{ records.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Recent Analysis</p>
              <p class="text-2xl font-bold text-gray-900">{{ getRecentRecordsCount() }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-teal-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Last Visit</p>
              <p class="text-sm font-bold text-gray-900">{{ getLastVisitDate() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div class="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p class="text-gray-600">Loading your medical records...</p>
      </div>

      <!-- No Records State -->
      <div v-else-if="!isLoading && records.length === 0" class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div class="mx-auto h-24 w-24 text-gray-400 mb-4">
          <DocumentTextIcon class="w-full h-full" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Medical Records Found</h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery ? 'No records match your search criteria.' : 'You haven\'t created any medical records yet.' }}
        </p>
        <NuxtLink
          to="/symptom-checker"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusIcon class="mr-2 h-5 w-5" />
          Create First Record
        </NuxtLink>
      </div>

      <!-- Records List -->
      <div v-else-if="!isLoading && records.length > 0" class="space-y-6">
        <div
          v-for="record in records"
          :key="record.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <div class="p-6">
            <!-- Record Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <DocumentTextIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ formatDate(record.timestamp) }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    Record ID: {{ record.id.substring(0, 8) }}...
                  </p>
                </div>
              </div>
              
              <!-- Urgency Badge -->
              <div v-if="record.result.urgency_level">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getUrgencyClass(record.result.urgency_level)"
                >
                  {{ record.result.urgency_level.toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Symptoms -->
            <div class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Reported Symptoms:</h4>
              <p class="text-gray-900 bg-gray-50 rounded-lg p-3">{{ record.symptoms }}</p>
            </div>

            <!-- Health Assessment Results -->
            <div class="space-y-4">
              <!-- Primary Diagnosis Section -->
              <div v-if="record.result.diagnosis" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-medium text-blue-800">Primary Diagnosis:</h4>
                  <div class="flex items-center space-x-2">
                    <span v-if="record.result.urgency_level" :class="_getUrgencyLevelClass(record.result.urgency_level)" class="text-xs font-semibold px-2 py-0.5 rounded-full">
                      {{ record.result.urgency_level.toUpperCase() }}
                    </span>
                    <div class="flex items-center">
                      <div class="w-20 bg-blue-200 rounded-full h-2 mr-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full"
                          :style="`width: ${record.result.confidence * 100}%`"
                        />
                      </div>
                      <span class="text-xs text-blue-700 font-medium">
                        {{ Math.round(record.result.confidence * 100) }}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <p class="text-blue-900 font-semibold text-lg">{{ record.result.diagnosis }}</p>
              </div>

              <!-- Differential Diagnosis / Possible Conditions -->
              <div v-if="record.result.candidates && record.result.candidates.length > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-amber-800 mb-3">
                  {{ record.result.diagnosis ? 'Differential Diagnosis:' : 'Possible Conditions:' }}
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(candidate, index) in record.result.candidates"
                    :key="candidate.diagnosis"
                    class="bg-white rounded-md p-3 border border-amber-100"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-amber-600 font-medium">#{{ index + 1 }}</span>
                        <span class="text-sm font-medium text-amber-900">{{ candidate.diagnosis }}</span>
                        <span v-if="candidate.urgency_level" :class="_getUrgencyLevelClass(candidate.urgency_level)" class="text-xs font-semibold px-2 py-0.5 rounded-full">
                          {{ candidate.urgency_level.toUpperCase() }}
                        </span>
                      </div>
                      <span class="text-xs text-amber-700 font-medium">
                        {{ Math.round(candidate.confidence * 100) }}% confidence
                      </span>
                    </div>
                    <div class="w-full bg-amber-100 rounded-full h-1.5">
                      <div 
                        class="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        :style="`width: ${candidate.confidence * 100}%`"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Treatment Plan -->
              <div v-if="record.result.drugs && record.result.drugs.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-green-800 mb-3">Recommended Treatment:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div
                    v-for="drug in record.result.drugs"
                    :key="drug"
                    class="flex items-center p-2 bg-white rounded border border-green-100"
                  >
                    <svg class="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-green-800">{{ drug }}</span>
                  </div>
                </div>
              </div>

              <!-- Lifestyle Recommendations -->
              <div v-if="record.result.lifestyle_guidance && record.result.lifestyle_guidance.length > 0" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-purple-800 mb-3">Lifestyle Recommendations:</h4>
                <div class="space-y-2">
                  <div
                    v-for="guidance in record.result.lifestyle_guidance"
                    :key="guidance"
                    class="flex items-start p-2 bg-white rounded border border-purple-100"
                  >
                    <svg class="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-purple-800">{{ guidance }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create New Record Button -->
      <div v-if="!isLoading && records.length > 0" class="mt-8 text-center">
        <NuxtLink
          to="/symptom-checker"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
        >
          <PlusIcon class="mr-2 h-5 w-5" />
          New Symptom Analysis
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PlusIcon 
} from '@heroicons/vue/24/outline';

// Composables
const { getUserId, initializeUser } = useUserSession();
const { getEHRRecords, searchEHRRecords } = useGraphQL();

// Reactive state
const records = ref([]);
const searchQuery = ref('');
const isLoading = ref(true);
const isSearching = ref(false);
const userId = ref('');

// Initialize and load records
onMounted(async () => {
  console.log('🚀 EHR page mounted');
  
  try {
    console.log('🔄 Initializing user session...');
    await initializeUser();
    
    console.log('👤 Getting user ID...');
    userId.value = await getUserId();
    console.log('✅ User ID obtained:', userId.value);
    
    if (userId.value) {
      console.log('📊 Loading records for user:', userId.value);
      await loadRecords();
    } else {
      console.error('❌ No user ID available after initialization');
    }
  } catch (error) {
    console.error('❌ Failed to initialize user session or load records:', error);
  }
});

// Watch for userId changes and reload records
watch(userId, async (newUserId, oldUserId) => {
  console.log('👀 User ID changed:', { old: oldUserId, new: newUserId });
  if (newUserId && newUserId !== oldUserId) {
    await loadRecords();
  }
});

// Helper to safely unwrap GraphQL response shapes
const _unwrap = (res, key) => {
  if (!res) return null;
  if (res[key]) return res[key];
  if (res.data && res.data[key]) return res.data[key];
  if (res.body && res.body.singleResult && res.body.singleResult.data && res.body.singleResult.data[key]) return res.body.singleResult.data[key];
  return null;
};

// Load records
const loadRecords = async () => {
  console.log('📋 loadRecords called, current userId:', userId.value);
  
  // Ensure we have a userId
  if (!userId.value) {
    console.log('⏳ No userId, attempting to get one...');
    userId.value = await getUserId();
  }
  
  if (!userId.value) {
    console.warn('⚠️ Cannot load records: no userId available after retry');
    isLoading.value = false;
    return;
  }

  console.log('🔄 Loading records for userId:', userId.value);
  isLoading.value = true;
  
  try {
    const result = await getEHRRecords(userId.value);
    console.log('📥 Raw result from getEHRRecords:', result);
    
    const items = _unwrap(result, 'getEHRRecords') || [];
    console.log('📦 Unwrapped items:', items, 'Count:', Array.isArray(items) ? items.length : 'Not array');
    
    // Ensure we only keep records for this user (defensive)
    records.value = Array.isArray(items) ? items.filter(r => String(r.userId) === String(userId.value)) : [];
    console.log('✅ Final records count:', records.value.length);
  } catch (error) {
    console.error('❌ Failed to load records:', error);
    records.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Perform search
const performSearch = async () => {
  // Ensure we have a userId
  if (!userId.value) {
    userId.value = await getUserId();
  }
  
  if (!userId.value) {
    console.warn('Cannot perform search: no userId available');
    return;
  }

  isSearching.value = true;
  try {
    if (searchQuery.value.trim()) {
      const result = await searchEHRRecords(userId.value, searchQuery.value.trim());
      const items = _unwrap(result, 'searchEHRRecords') || [];
      records.value = Array.isArray(items) ? items.filter(r => String(r.userId) === String(userId.value)) : [];
    } else {
      await loadRecords();
    }
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    isSearching.value = false;
  }
};

// Map urgency level to badge classes (same helper as symptom-checker)
const _getUrgencyLevelClass = (urgency_level) => {
  const s = String(urgency_level || '').toLowerCase();
  if (s === 'high') return 'bg-red-100 text-red-700';
  if (s === 'moderate') return 'bg-yellow-100 text-yellow-800';
  if (s === 'low') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-700';
};

// Clear search
const clearSearch = async () => {
  searchQuery.value = '';
  await loadRecords();
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get urgency class
const getUrgencyClass = (urgency) => {
  const urgencyLower = urgency.toLowerCase();
  if (urgencyLower === 'high') {
    return 'bg-red-100 text-red-800';
  } else if (urgencyLower === 'moderate') {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

// Get recent records count (last 30 days)
const getRecentRecordsCount = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return records.value.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= thirtyDaysAgo;
  }).length;
};

// Get last visit date
const getLastVisitDate = () => {
  if (records.value.length === 0) return 'Never';
  
  const lastRecord = records.value[0]; // Records are sorted by timestamp desc
  const date = new Date(lastRecord.timestamp);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// SEO
useHead({
  title: 'Electronic Health Records - Syncertica Vitalis Lite',
  meta: [
    {
      name: 'description',
      content: 'View and search your complete medical history, symptom analyses, and healthcare records in one secure location.'
    }
  ]
});
</script>

<style scoped>
/* Custom styles if needed */
</style>