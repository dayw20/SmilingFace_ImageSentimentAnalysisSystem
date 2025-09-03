# Image Sentiment Analysis System

A full-stack web application that analyzes facial expressions in images from Wikipedia articles using Google Cloud Vision API. Built with TypeScript, Node.js, Express, and React.

## 🚀 Features

- **Wikipedia Integration**: Automatically fetches images from Wikipedia articles and their linked pages
- **Facial Analysis**: Uses Google Cloud Vision API to detect and analyze facial expressions
- **Concurrent Processing**: Efficiently handles multiple analysis jobs with configurable concurrency limits
- **Real-time Updates**: Live job status updates with incremental loading
- **Modern UI**: Clean, responsive React frontend with Material-UI components
- **Robust Error Handling**: Retry mechanisms and graceful failure handling

## 🏗️ Architecture

### Backend
- **Express.js** server with TypeScript
- **Concurrent job processing** with configurable limits
- **Rate limiting** for external API calls (Wikipedia, Google Vision)
- **Queue management** for handling high load scenarios

### Frontend
- **React 18** with TypeScript
- **Material-UI** for modern, accessible components
- **Real-time updates** via polling mechanism
- **Responsive design** for various screen sizes

### External APIs
- **Google Cloud Vision API** for facial expression detection
- **Wikipedia API** for content retrieval

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Material-UI
- **Testing**: AVA, Jest, Supertest
- **Build Tools**: TypeScript Compiler, Create React App
- **External Services**: Google Cloud Vision API, Wikipedia API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Vision API credentials
- Internet connection for Wikipedia API access

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd image-sentiment-analysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Set up Google Cloud Vision API**
   - Create a Google Cloud project
   - Enable Vision API
   - Set up authentication (service account key or environment variables)
   - Update configuration in `src/connections.ts`

4. **Build the project**
   ```bash
   npm run compile
   cd frontend && npm run build
   cd ..
   ```

## 🎯 Usage

1. **Start the server**
   ```bash
   npm start
   ```

2. **Open your browser**
   Navigate to `http://localhost:8080`

3. **Submit analysis jobs**
   - Enter a Wikipedia topic name
   - Choose whether to include linked pages
   - Monitor real-time progress
   - View detailed results

## 🔧 Configuration

### Concurrency Limits
- **Job Processing**: Maximum 5 concurrent jobs
- **Vision API Calls**: Maximum 5 concurrent requests
- **Wikipedia API Calls**: Maximum 5 concurrent requests

### Timeouts
- **Vision API**: 5 seconds
- **Wikipedia API**: 3 seconds
- **Retry Attempts**: 3 with exponential backoff

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend && npm test
```

## 📁 Project Structure

```
├── src/                    # Backend source code
│   ├── backend.ts         # Main Express application
│   ├── connections.ts     # External API connections
│   ├── visionapi.ts       # Google Vision API integration
│   ├── wikipediaapi.ts    # Wikipedia API integration
│   └── jobdata.ts         # Data models and types
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── Dashboard.tsx  # Main dashboard interface
│   │   └── TopicAnalysis.tsx # Analysis display component
│   └── build/             # Built frontend files
├── tests/                 # Backend test suite
└── tests_util/            # Test utilities and helpers
```

## 🔒 Security Considerations

- API keys should be stored securely (environment variables or secure key management)
- Rate limiting prevents API abuse
- Input validation for all user inputs
- CORS configuration for production deployment

## 🚀 Deployment

### Environment Variables
```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
PORT=8080
NODE_ENV=production
```

### Production Build
```bash
npm run compile
cd frontend && npm run build
cd ..
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Cloud Vision API for facial analysis capabilities
- Wikipedia for providing open content
- Material-UI for the beautiful component library
- The open source community for the amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error logs and reproduction steps

---

**Note**: This project requires Google Cloud Vision API credentials to function. Please ensure you have proper authentication set up before running the application.
