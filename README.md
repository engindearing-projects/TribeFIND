# 🌟 TribeFind - Location-Based Social Discovery Platform

> **Snapchat meets Real-World Connections** - A React Native app for discovering and connecting with nearby tribes through shared activities

[![Version](https://img.shields.io/badge/version-1.4.2-blue.svg)](https://github.com/jfuginay/snapchat-clone)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)
[![Framework](https://img.shields.io/badge/framework-React%20Native%20%7C%20Expo-000.svg)](https://expo.dev/)

**TribeFind** is a location-based social discovery platform that combines Snapchat-style media sharing with geo-tagged activity posts. Find and connect with nearby users doing similar activities, build your tribe, and share your adventures through photos and stories.

---

## 🎓 **For Instructors - Quick Setup**

### **📱 Test on iPhone Immediately (Recommended)**
**TribeFind is live on TestFlight** - no setup required! Just install and test all features:

📧 **Request TestFlight Access**: Email `j.wylie.81@gmail.com` for instant TestFlight invitation  
📖 **Full TestFlight Guide**: [TESTFLIGHT_DISTRIBUTION_GUIDE.md](TESTFLIGHT_DISTRIBUTION_GUIDE.md)

### **⚡ Local Development (5 minutes)**
**Complete setup guide**: [INSTRUCTOR_QUICK_START.md](INSTRUCTOR_QUICK_START.md)

```bash
git clone [repo-url]
cd snapchat-clone
git checkout demo
npm install
# Follow INSTRUCTOR_QUICK_START.md for .env setup
expo start
```

**Demo Accounts Ready**:
- Email: `demo1@tribefind.com` / Password: `demo123456`
- Email: `demo2@tribefind.com` / Password: `demo123456`

---

## 🚀 **Latest Features & Updates**

### **🎥 Professional Video Capture** ✅
- **Multiple Durations**: 3s, 5s, 10s, 30s clips
- **Professional UI**: Full-screen recording with progress tracking
- **Cloud Storage**: Automatic upload to Supabase
- **Gallery Management**: Grid view with native video player

### **🔐 Universal Authentication** ✅
- **Twitter OAuth**: Fixed redirect issues, seamless sign-in
- **Google Sign-In**: Universal authentication across platforms
- **Email Auth**: Traditional email/password with verification
- **Profile System**: Complete user profiles with avatar upload

### **📍 Real-time Location & Social** ✅
- **Live Location Sharing**: See friends on interactive map
- **Privacy Controls**: Granular location sharing settings
- **Friend System**: Add/remove friends with real-time status
- **Activity Matching**: Find people with shared interests nearby

### **💬 Real-time Messaging** ✅
- **Instant Chat**: Real-time messaging with Supabase
- **Chat Lists**: Organized conversation management
- **Message Status**: Read receipts and delivery confirmation

### **📸 Advanced Camera System** ✅
- **Snapchat-style Interface**: Familiar, intuitive camera UI
- **Photo Filters**: Real-time image processing
- **Cloud Integration**: Automatic photo backup
- **Media Gallery**: Beautiful grid-based photo management

---

## 🎯 **Key Demo Features**

### **1. Tribe Discovery** 🗺️
- Find people with shared interests nearby using geo-tagged posts
- See what activities users are doing in your area
- Filter by activity type to find the perfect tribe match
- Send connection requests to join or invite others to your tribe

### **2. Snapchat-Style Media** 📸
- Professional camera with real-time filters
- Photo and video capture with multiple durations
- Stories and timeline feed
- Cloud storage with instant sync

### **3. Real-Time Social** 👥
- Live location sharing with privacy controls
- Interactive map showing nearby tribe members
- Instant messaging and friend management
- Real-time status updates

### **4. Universal Access** 🔑
- Multiple sign-in options (Twitter, Google, Apple, Email)
- Cross-platform compatibility (iOS/Android)
- Demo accounts for immediate testing

---

## 📱 **Screenshots**

Get a feel for TribeFind's intuitive interface and powerful features:

<div align="center">

### Authentication & Onboarding
<img src="IMG_0643.PNG" width="200" alt="Sign In Screen" />

*Universal sign-in with Twitter, Google, or Email*

### Real-time Location & Social Discovery
<img src="IMG_0647.PNG" width="200" alt="Map Screen" />

*Interactive map showing friends and nearby activities*

### Professional Camera Interface
<img src="IMG_0651.PNG" width="200" alt="Camera Screen" />

*Snapchat-style camera with filters and video recording*

### Instant Messaging
<img src="IMG_0655.PNG" width="200" alt="Chat Screen" />

*Real-time messaging with delivery confirmation*

### AI-Powered Local Knowledge
<img src="IMG_0659.PNG" width="200" alt="Activities Screen" />

*Ask the AI about local recommendations and hidden gems*

</div>

---

## 🛠 **Technology Stack**

### **Frontend**
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for routing

### **Backend Services**
- **Supabase**: Database, authentication, real-time, storage
- **PostGIS**: Geographic queries and location-based discovery
- **Row Level Security**: Data protection and privacy
- **Real-time Subscriptions**: Live updates for messaging and location

### **Media & Camera**
- **react-native-vision-camera**: Professional video recording
- **expo-camera**: Photo capture with filters
- **expo-av**: Video playback and media management
- **Supabase Storage**: Cloud media storage and delivery

### **Location & Maps**
- **react-native-maps**: Interactive map visualization
- **expo-location**: GPS and location tracking
- **PostGIS**: Efficient geo-spatial queries

---

## 🎓 **Educational Value**

This project demonstrates **production-ready mobile development** patterns:

### **✅ Location-Based Discovery**
- PostGIS for efficient geo-spatial queries
- Real-time location tracking with privacy controls
- Activity-based matching algorithm
- Interactive map visualization with react-native-maps

### **✅ Real-time Social Features**
- WebSocket connections for instant messaging
- Live location updates with Supabase subscriptions
- Real-time friend status tracking
- Efficient state management with Redux

### **✅ Mobile Development**
- Cross-platform React Native with Expo
- Native camera and media APIs
- Cloud storage integration with Supabase
- Multiple OAuth providers (Twitter, Google, Apple)

### **✅ Production Architecture**
- Scalable PostgreSQL database with PostGIS
- Secure authentication flows with Row Level Security
- Optimized battery-efficient location tracking
- Comprehensive type safety with TypeScript

---

## 📚 **Documentation & Guides**

### **Setup & Testing**
- [INSTRUCTOR_QUICK_START.md](INSTRUCTOR_QUICK_START.md) - 5-minute setup
- [TESTFLIGHT_DISTRIBUTION_GUIDE.md](TESTFLIGHT_DISTRIBUTION_GUIDE.md) - iPhone testing
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing
- [STREAMLINE_PLAN.md](STREAMLINE_PLAN.md) - Feature roadmap and launch plan

### **Features & Implementation**
- [VIDEO_CAPTURE_IMPLEMENTATION_GUIDE.md](VIDEO_CAPTURE_IMPLEMENTATION_GUIDE.md) - Video features
- [CAMERA_SETUP_GUIDE.md](CAMERA_SETUP_GUIDE.md) - Camera implementation

### **Database & Infrastructure**
- [COMPLETE_DATABASE_SETUP.sql](COMPLETE_DATABASE_SETUP.sql) - Full database schema
- [STORAGE_SETUP_GUIDE.md](STORAGE_SETUP_GUIDE.md) - File storage configuration
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment

---

## 🎬 **Live Demo Available**

**TestFlight**: Email `j.wylie.81@gmail.com` for immediate access  
**Local Demo**: Use [INSTRUCTOR_QUICK_START.md](INSTRUCTOR_QUICK_START.md)  
**Demo Accounts**: `demo1@tribefind.com` / `demo123456`

---

**Built with ❤️ for real-world connections**

*TribeFind v1.4.2 - Location-based social discovery for building your tribe* 🌟 