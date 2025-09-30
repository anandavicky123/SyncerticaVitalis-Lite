# Syncertica Vitalis Lite

A comprehensive healthcare application featuring AI-powered symptom checking and Electronic Health Records (EHR) management.

## 🏥 Features

### 🤖 AI-Powered Symptom Checker
- **Intelligent Diagnosis**: Describe symptoms and receive AI-powered analysis using Google Gemini
- **Multi-step Diagnosis**: For vague symptoms, get follow-up questions to narrow down the diagnosis
- **Confidence Levels**: Get confidence percentages for each diagnosis
- **Medication Recommendations**: Receive drug prescription suggestions
- **Urgency Assessment**: Understand the urgency level of your condition

### 📋 Electronic Health Records (EHR)
- **Complete History**: All symptom analyses are automatically saved to your medical records
- **Advanced Search**: Search through your medical history using MongoDB Atlas Search
- **Redis Caching**: Fast data retrieval with Upstash Redis caching
- **User Identification**: Secure UUID-based session management without requiring login

### 🎨 Modern UI/UX
- **Healthcare Theme**: Beautiful blue-green color scheme designed for healthcare applications
- **Responsive Design**: Works seamlessly across all devices
- **Tailwind CSS**: Modern, utility-first styling
- **Smooth Animations**: Engaging user interactions and transitions

## 🔧 Technology Stack

### Frontend
- **Nuxt 3**: Vue.js framework with server-side rendering
- **Vue 3**: Progressive JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons

### Backend & APIs
- **GraphQL**: Query language with Apollo Server integration
- **MongoDB**: NoSQL database for storing EHR records
- **MongoDB Atlas Search**: Full-text search capabilities
- **Redis (Upstash)**: In-memory caching for performance
- **Google Gemini AI**: Advanced AI model for symptom analysis

### Services Integration
- **MongoDB Atlas**: Cloud-hosted MongoDB with advanced search
- **Upstash Redis**: Serverless Redis for caching
- **Google AI Studio**: Gemini AI API for medical analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Upstash Redis account
- Google AI Studio account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/syncertica-vitalis-lite.git
   cd syncertica-vitalis-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```bash
   UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
   MONGO_URI="your_mongodb_connection_string"
   GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Set up MongoDB Atlas Search**
   - Create a search index named "default" on your EHR collection
   - Configure it to search the `symptoms` and `result.diagnosis` fields

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 How to Use

### First Visit
1. **Landing Page**: Visit the homepage to learn about the features
2. **Getting Started**: Click the "Getting Started" button to automatically generate your UUID
3. **Session Management**: Your UUID is stored locally for future visits

### Symptom Checking
1. **Describe Symptoms**: Enter your symptoms in detail on the Symptom Checker page
2. **AI Analysis**: The system analyzes your symptoms using Google Gemini AI
3. **Review Results**: Get diagnosis, confidence levels, medication suggestions, and urgency assessment
4. **Follow-up Questions**: For unclear symptoms, answer additional questions for better accuracy
5. **Save to Records**: Save the analysis to your EHR for future reference

### Medical Records
1. **View History**: Access all your previous symptom analyses
2. **Search Records**: Use the search feature to find specific diagnoses or symptoms
3. **Track Progress**: Monitor your health journey over time

## 🔒 Security & Privacy

- **No Personal Data Required**: Uses UUID-based identification instead of personal information
- **Local Storage**: User sessions are stored locally on your device
- **Secure APIs**: All external API calls are encrypted and secure
- **Medical Disclaimer**: Clear disclaimers about the nature of AI-powered medical advice

## ⚠️ Medical Disclaimer

**IMPORTANT**: This application is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals for proper diagnosis and treatment. In case of medical emergencies, contact your local emergency services immediately.

## 🛠️ Development

### Project Structure
```
├── app/
│   ├── pages/           # Vue pages
│   └── app.vue         # Main app component
├── assets/
│   └── css/            # Stylesheets
├── composables/        # Vue composables
├── server/
│   └── api/            # GraphQL API endpoints
├── .env                # Environment variables
└── nuxt.config.ts      # Nuxt configuration
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for medical analysis capabilities
- MongoDB Atlas for robust database and search functionality
- Upstash for high-performance Redis caching
- Heroicons for beautiful SVG icons
- Tailwind CSS for modern styling utilities

---

**Built with ❤️ for better healthcare accessibility**
