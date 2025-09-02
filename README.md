# DecentAI

A modern web application built with React and Python backend for AI-powered community engagement, featuring real-time sentiment analysis, interactive polls, and intelligent chat capabilities.

## 📋 Project Overview

DecentAI is a comprehensive platform that leverages artificial intelligence to facilitate meaningful community interactions and policy discussions. The platform combines advanced NLP capabilities with modern web technologies to provide real-time sentiment analysis, interactive polling systems, and AI-powered chat functionality.

## Screenshots

Here are some screenshots of the app showcasing its key features and design:

<img src="public/dai1.png" alt="Home Screen" width="250" />

<img src="public/dai2.png" alt="Polls" width="250" />

<img src="public/dai3.png" alt="Surveys" width="250" />

<img src="public/dai4.png" alt="Sentiment" width="250" />

## 🚀 Core Features

### 🤖 AI-Powered Features
- **Intelligent Chat**: AI-powered conversations using Google's Gemini API
- **Real-time Sentiment Analysis**: Advanced NLP for text sentiment analysis
- **Overall Sentiment Summaries**: AI-generated comprehensive summaries of:
  - All chat conversations sentiment trends
  - Polls and voting pattern analysis
- **Content Analysis**: Automated content moderation and trend detection

### 📊 Community Engagement
- **Interactive Polls**: Create and participate in polls with real-time voting
- **Advanced Search**: Search functionality across all data tables
- **Data Analytics Dashboard**: Comprehensive analytics with user insights
- **Real-time Updates**: Live data synchronization across components

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure user authentication system
- **Protected Routes**: Role-based access control
- **Secure Data Storage**: MongoDB with proper data validation
- **Session Management**: Secure session handling with Flask

### 📈 Data Management
- **MongoDB Integration**: NoSQL database for flexible data storage
- **Real-time Data Visualization**: Interactive charts using Recharts
- **Search & Filtering**: Advanced search across all data types
- **Export Capabilities**: Data export functionality for analytics

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme Support**: Modern design system
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React
- **Recharts** - Composable charting library
- **HeroIcons** - Beautiful hand-crafted SVG icons
- **Google Generative AI** - AI-powered content generation

### Backend
- **Python Flask** - Lightweight WSGI web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **JWT Authentication** - JSON Web Tokens for secure authentication
- **CORS** - Cross-Origin Resource Sharing support
- **Wink NLP** - Natural Language Processing library

### DevOps & Tools
- **npm/yarn** - Package management
- **Git** - Version control
- **ESLint** - Code linting
- **Virtual Environment** - Python dependency isolation

## 🚀 Key Features Implemented

### 🔍 Advanced Search Functionality
- **Polls Search**: Search through poll titles and options with real-time filtering
- **Data Analytics Search**: Search across users, chats, and transactions tables
- **Smart Filtering**: Case-insensitive search with instant results
- **No Results Handling**: User-friendly messages when no matches found

### 📊 Sentiment Analysis System
- **Individual Text Analysis**: Real-time sentiment analysis using Wink NLP
- **AI-Powered Summaries**: Gemini API integration for comprehensive sentiment analysis
- **Chat Sentiment Summary**: Overall sentiment analysis of all chat conversations
- **Polls Sentiment Summary**: Voting pattern and sentiment analysis of all polls
- **Analysis History**: Persistent storage and display of analysis results

### 🗳️ Interactive Polling System
- **Poll Creation**: Create polls with multiple options
- **Real-time Voting**: Live voting with duplicate prevention
- **Vote Tracking**: Secure voter tracking system
- **Results Visualization**: Dynamic percentage bars and vote counts
- **Search Integration**: Search through polls and their options

### 💬 AI Chat System
- **Gemini AI Integration**: Powered by Google's Gemini 1.5 Flash model
- **Contextual Conversations**: Maintains conversation history
- **Voice Input**: Speech recognition for hands-free interaction
- **Text-to-Speech**: Audio output for chat responses
- **Real-time Responses**: Instant AI-generated responses

### 📈 Data Analytics Dashboard
- **Comprehensive Overview**: Users, chats, polls, and transactions analytics
- **Interactive Charts**: Visual data representation using Recharts
- **Search Integration**: Search across all data tables
- **Real-time Updates**: Live data synchronization
- **Export Ready**: Structured data for further analysis

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Session Management**: Secure session handling
- **Data Validation**: Input validation and sanitization
- **MongoDB Security**: Secure database connections

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface with Tailwind CSS
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Smooth animations and hover effects
- **Loading States**: User feedback during data operations
- **Error Handling**: Comprehensive error messages and recovery options

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** 3.8+
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/NafisRayan/DecentAI.git
cd DecentAI
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start development server
npm start
```
The frontend will be available at `http://localhost:3000`

### 3. Backend Setup

#### Create Python Virtual Environment
```powershell
# Navigate to Backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1
```

#### Install Backend Dependencies
```powershell
# Install Python packages
pip install -r requirements.txt
```

#### Start Backend Server

```
cd .\Backend\;venv\Scripts\Activate.ps1;python app.py
```

#### MongoDB Setup
- **Option A: Local MongoDB**
  - Install MongoDB Community Server
  - Start MongoDB service
  - Default connection: `mongodb://localhost:27017`

- **Option B: MongoDB Atlas (Cloud)**
  - Create account at mongodb.com
  - Create a cluster
  - Get connection string and update in `app.py`

#### Environment Configuration
Create a `.env` file in the Backend directory (optional):
```env
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-secret-key
```

### 4. Start the Backend Server
```powershell
# From Backend directory with virtual environment activated
python app.py
```
The backend will run on `http://localhost:5000`

## 🚀 Running the Application

1. **Start Backend First:**
   ```bash
   cd Backend
   venv\Scripts\Activate.ps1
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   # In a new terminal
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
DecentAI/
├── public/                 # Static assets
│   ├── dai1.png           # Screenshots
│   ├── dai2.png
│   ├── dai3.png
│   ├── dai4.png
│   └── favicon.ico
├── src/                   # Frontend React application
│   ├── components/        # Reusable UI components
│   │   ├── Layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── model_artifacts.json
│   ├── pages/            # Main application pages
│   │   ├── AIChat.jsx    # AI chat interface
│   │   ├── Chat.jsx      # Chat functionality
│   │   ├── Dashboard.jsx # Main dashboard
│   │   ├── DataAnalytics.jsx # Analytics dashboard
│   │   ├── LoginRegister.jsx # Authentication
│   │   ├── Polls.jsx     # Polling system
│   │   ├── SentimentAnalysis.jsx # Sentiment analysis
│   │   └── UserSettings.jsx # User settings
│   ├── App.jsx           # Main app component
│   ├── index.js          # App entry point
│   └── setupTests.js     # Test setup
├── Backend/              # Python Flask backend
│   ├── app.py           # Main Flask application
│   ├── requirements.txt # Python dependencies
│   ├── test_backend.py  # Backend tests
│   └── venv/            # Virtual environment
├── package.json         # Node.js dependencies
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md           # Project documentation
```

## 🛠️ Built With

### Frontend Technologies
- **[React 18](https://reactjs.org/)** - Modern JavaScript library for building user interfaces
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[React Router](https://reactrouter.com/)** - Declarative routing for React applications
- **[Recharts](https://recharts.org/)** - Composable charting library built on React components
- **[HeroIcons](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[Google Generative AI](https://ai.google.dev/)** - AI-powered content generation and analysis

### Backend Technologies
- **[Python Flask](https://flask.palletsprojects.com/)** - Lightweight WSGI web application framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for flexible data storage
- **[PyMongo](https://pymongo.readthedocs.io/)** - Python driver for MongoDB
- **[JWT](https://jwt.io/)** - JSON Web Tokens for secure authentication
- **[Flask-CORS](https://flask-cors.readthedocs.io/)** - Cross-Origin Resource Sharing for Flask
- **[Wink NLP](https://winkjs.org/wink-nlp/)** - Natural Language Processing library

### Development Tools
- **[npm](https://www.npmjs.com/)** - Package manager for Node.js
- **[Git](https://git-scm.com/)** - Distributed version control system
- **[ESLint](https://eslint.org/)** - Tool for identifying and reporting patterns in ECMAScript/JavaScript code
- **[Python venv](https://docs.python.org/3/library/venv.html)** - Virtual environment for Python

## 🔌 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout

### Data Management
- `GET /users` - Get all users
- `GET /chats` - Get all chat messages
- `POST /chats` - Send chat message
- `GET /polls` - Get all polls
- `POST /polls` - Create new poll
- `POST /polls/<poll_id>/vote` - Vote on a poll
- `GET /transactions` - Get all transactions

### AI & Analysis
- `GET /analysis-history` - Get sentiment analysis history
- `POST /analysis-history` - Save analysis result
- `DELETE /analysis-history` - Clear analysis history

## 🚀 Deployment

### Frontend Deployment
```bash
# Build the production version
npm run build

# The build artifacts will be stored in the `build/` directory
```

### Backend Deployment
```bash
# Set environment variables
export MONGODB_URI="your-mongodb-connection-string"
export JWT_SECRET="your-jwt-secret"

# Run with production WSGI server
gunicorn --bind 0.0.0.0:5000 app:app
```


## 🙏 Acknowledgments

- Google Generative AI for providing powerful AI capabilities
- The React and Flask communities for excellent documentation
- MongoDB for reliable database solutions
- Tailwind CSS for beautiful, responsive design utilities

---

**DecentAI** - Empowering communities through AI-driven engagement and intelligent analysis.
