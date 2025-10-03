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

### Backend & APIs
- **GraphQL**: Query language with Apollo Server integration
- **MongoDB**: NoSQL database for storing EHR records
- **MongoDB Atlas Search**: Full-text search capabilities
- **Google Gemini AI**: Advanced AI model for symptom analysis

### Services Integration
- **MongoDB Atlas**: Cloud-hosted MongoDB with advanced search
- **Google AI Studio**: Gemini AI API for medical analysis

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Syncertica Source Available License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for medical analysis capabilities
- MongoDB Atlas for robust database and search functionality
- Tailwind CSS for modern styling utilities

---

**Built with ❤️ for better healthcare accessibility**
