// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI,
    geminiApiKey: process.env.GEMINI_API_KEY,
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    public: {
      graphqlEndpoint: process.env.NODE_ENV === 'production' ? 'https://your-domain.com/api/graphql' : 'http://localhost:3000/api/graphql'
    }
  }
})