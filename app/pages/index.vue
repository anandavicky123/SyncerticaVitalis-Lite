<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-blue-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-blue-900">Syncertica Vitalis Lite</h1>
            </div>
          </div>
          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </NuxtLink>
            <NuxtLink to="/symptom-checker" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Symptom Checker
            </NuxtLink>
            <NuxtLink to="/ehr" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              EHR Records
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health, 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              Simplified
            </span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 leading-relaxed">
            Advanced healthcare technology at your fingertips. Get instant symptom analysis powered by AI 
            and maintain comprehensive electronic health records - all in one secure platform.
          </p>
          
          <!-- Getting Started Button -->
          <button
            :disabled="isInitializing"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            @click="handleGetStarted"
          >
            <svg v-if="isInitializing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isInitializing ? 'Initializing...' : 'Getting Started' }}
            <ArrowRightIcon class="ml-2 h-5 w-5" />
          </button>
          
          <p v-if="userId" class="mt-4 text-sm text-gray-500">
            Welcome back! Your session ID: {{ userId.substring(0, 8) }}...
          </p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- AI Symptom Checker Feature -->
        <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 class="ml-4 text-2xl font-semibold text-gray-900">AI-Powered Symptom Checker</h3>
          </div>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Describe your symptoms and get instant, AI-powered analysis. Our advanced system provides 
            potential diagnoses, medication recommendations, and urgency levels to help guide your healthcare decisions.
          </p>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
              Intelligent symptom analysis
            </li>
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
              Drug prescription suggestions
            </li>
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
              Confidence levels and urgency assessment
            </li>
          </ul>
        </div>

        <!-- EHR Feature -->
        <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 class="ml-4 text-2xl font-semibold text-gray-900">Electronic Health Records</h3>
          </div>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Maintain a comprehensive history of your health consultations. All your symptom checks and 
            diagnoses are securely stored and easily searchable for future reference.
          </p>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              Complete medical history tracking
            </li>
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              Advanced search capabilities
            </li>
            <li class="flex items-center">
              <CheckIcon class="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              Secure and private data storage
            </li>
          </ul>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-6 w-6 text-amber-600" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-amber-800">Important Medical Disclaimer</h3>
            <div class="mt-2 text-sm text-amber-700">
              <p>
                This application provides general health information and should not replace professional medical advice. 
                Always consult with qualified healthcare professionals for proper diagnosis and treatment. 
                In case of medical emergencies, contact your local emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ArrowRightIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

// Composables
const { initializeUser, userId } = useUserSession();
const router = useRouter();

// Reactive state
const isInitializing = ref(false);

// Initialize user on component mount
onMounted(async () => {
  await initializeUser();
});

// Handle getting started button
const handleGetStarted = async () => {
  isInitializing.value = true;
  
  try {
    // Ensure user is initialized
    if (!userId.value) {
      await initializeUser();
    }
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to symptom checker
    await router.push('/symptom-checker');
  } catch (error) {
    console.error('Error initializing user:', error);
  } finally {
    isInitializing.value = false;
  }
};

// SEO
useHead({
  title: 'Syncertica Vitalis Lite - AI-Powered Healthcare Platform',
  meta: [
    {
      name: 'description',
      content: 'Advanced healthcare technology with AI-powered symptom checker and electronic health records. Get instant medical insights and maintain comprehensive health history.'
    }
  ]
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>