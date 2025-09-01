# 🧾 CoderBoost 🚀

## 📌 Project Description

This project is part of the Integrator Project "CodeUp Riwi: Your jump to the next level" and aims to develop an interactive website (MPA or SPA) that addresses a problem or need in one of the allowed categories.

This project is a Single Page Application (SPA) dedicated to an educational web application designed for managing and viewing educational video content with social functionalities and integrated artificial intelligence.

---

## 🎯 Features

### **User Management:**
- Session management (login, persistence, and logout)

### **Video Visualization and Playback:**
- Integrated video player with HTML5 Video API
- Adaptive streaming based on user connection
- Automatic thumbnails for preview
- Multimedia optimization through Cloudinary CDN

### **Content Upload and Management:**
- Direct video upload from browser
- Automatic processing (transcoding, compression, and format conversion)
- Secure cloud storage with Cloudinary
- Automatic thumbnail generation for videos
- Video administration through REST endpoints from backend

### **Course and Workshop Catalog:**
- Listing of workshops and courses in a responsive grid
- Detailed view of each course
- Quick access from main dashboard

### **Comment System:**
- Create, edit, and delete comments (complete CRUD)
- Real-time updates without page reload
- Data validation before saving comments
- Social interaction between users on each video

### **Artificial Intelligence Chat:**
- Integrated virtual assistant through Google Gemini API
- Intelligent automatic responses to help with learning
- Real-time processing from backend

### **User Experience and UI/UX:**
- Single Page Application (SPA) for fluid navigation
- Dynamic routing without page reload

### **Integration with External Services:**
- Cloudinary: Video and image storage
- Google Gemini API: intelligent chat processing
- Vercel: serverless backend deployment
- MySQL: structured data persistence (users, videos, comments, workshops)

---

## 🧠 Technologies Used

### Core Technologies
- **Frontend**: JavaScript ES6+, HTML5, CSS3
- **CSS Framework**: Bootstrap 5
- **Backend**: Node.js (Vercel Runtime)
- **Database**: MySQL

### APIs and Services
- **Cloudinary**: Complete multimedia management (storage, processing, CDN)
- **OpenAI GPT**: Intelligent chat
- **Vercel Platform**: Hosting and deployment
- **REST APIs**: Client-server communication

### Multimedia Pipeline
- **Upload**: Cloudinary Upload Widget
- **Processing**: Automatic transcoding (MP4, WebM, etc.)
- **Delivery**: CDN optimized by geolocation
- **Thumbnails**: Automatic generation with customizable timestamps

### Development Tools
- **Version Control**: Git
- **Module Bundling**: Native ES6 Modules
- **Responsive Design**: Mobile-first approach
- **Media Management**: Cloudinary Dashboard for administration
- **JavaScript**: Main SPA logic
- **Vite**: Fast bundler for modern development
- **HTML and CSS**: Interface structure and styles

---

## 💻 Execution Instructions

### 📋 Prerequisites
- **Node.js** v14.0.0 or higher
- **npm** (included with Node.js)
- **Git** to clone the repository

### 🔧 Installation and Configuration

#### 1. Clone the Repository
```bash
# Clone the frontend repository
git clone https://github.com/SebitasDown/cb-front
cd cb-front

# Verify project structure
ls -la
```

#### 2. Install Dependencies
```bash
# Install all project dependencies
npm install
```

### 🚀 Project Execution

#### Development Mode
```bash
# Start development server with automatic reload
npm run dev

# The server will start at:
# http://localhost:3000
# It will open automatically in the browser
```

#### Production Build
```bash
# Build the project for production
npm run build

# Preview the production build
npm run preview
```

---

## 📁 Project Structure

```
cb-front/
├── assets/
│   ├── images/          # Project images and logos
│   ├── styles.css       # Main stylesheet
│   └── uploadPanel.css  # Upload panel styles
├── features/
│   ├── auth/           # Authentication features
│   ├── chat/           # AI chat functionality
│   ├── comments/       # Comment system
│   ├── home/           # Home page features
│   ├── search/         # Search functionality
│   ├── upload/         # Video upload features
│   ├── videos/         # Video player features
│   └── workshops/      # Workshop management
├── router/
│   ├── router.js       # Main router
│   └── routes.js       # Route definitions
├── service/
│   └── api.js          # API service functions
├── views/
│   ├── home.html       # Home page
│   ├── login.html      # Login page
│   ├── videoplayer.html # Video player page
│   ├── videos.html     # Videos listing page
│   └── workshop.html   # Workshop page
├── index.html          # Main HTML file
├── main.js             # Main application entry point
├── package.json        # Project dependencies
└── vite.config.js      # Vite configuration
```

---

## 🌟 Key Features

### **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### **Real-time Updates**
- Live comment updates
- Dynamic content loading
- Smooth navigation transitions

### **AI Integration**
- Intelligent chat assistant
- Context-aware responses
- Learning-focused interactions

### **Social Features**
- User comments and interactions
- Video sharing capabilities
- Community engagement tools

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-url.vercel.app

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# AI Configuration
VITE_AI_API_KEY=your_ai_api_key
```

---

## 🚀 Deployment

### Vercel Deployment
The project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy the dist folder to your hosting provider
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team Information

**Team Name**: SperDev  
**Clan**: Lovelace

### Team Members:
- **Sebastián Mazo Areiza**
- **Susana Gutiérrez Callejas**
- **Daniela Orrego Marín**
- **Pablo Jeremías Campos Rueda**
- **Yohann Exneider Rodas Arango**

---

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI chat integration
- **v1.2.0** - Enhanced responsive design
- **v1.3.0** - Improved video player and comments system

---

*Made with ❤️ by SperDev Team*
---
