# 🤖 AI-Powered Blog Summarizer

A Next.js application that scrapes blog posts, generates intelligent summaries using **Google Gemini AI**, translates to Urdu, and stores data in MongoDB and Supabase.

---

## 🔗 Live Demo

🌐 [View the App on Vercel](https://nexium-asad-assign2.vercel.app/)

---

## ✨ Features

- **🌐 Web Scraping**: Extracts content from blog URLs using Cheerio
- **🤖 AI Summarization**: Generates intelligent summaries using Google Gemini AI
- **🌍 AI Translation**: Translates summaries to Urdu using Gemini AI (with dictionary fallback)
- **⚡ Optimized Processing**: Combined operations for faster AI processing
- **🗄️ Database Integration**: 
  - MongoDB: Stores full blog content
  - Supabase: Stores summaries for quick access
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS
- **🔧 Fallback Systems**: Robust error handling with static logic fallbacks

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `blog_summarizer`
- The collections will be created automatically

#### Supabase
- Create a new Supabase project
- Run the SQL script in `database/supabase_setup.sql` in your Supabase SQL editor
- Get your project URL and anon key from the Supabase dashboard

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key for use in environment variables

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/blog_summarizer

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

---

## 🔗 API Endpoints

### `POST /api/summarize`
Processes a blog URL and returns an AI-powered summary.

**Request Body:**
```json
{
  "url": "https://example.com/blog-post",
  "useOptimized": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Blog Post Title",
    "summary": "AI-generated summary...",
    "summaryUrdu": "AI-translated Urdu summary...",
    "keyPoints": ["AI-extracted Point 1", "AI-extracted Point 2"],
    "wordCount": 150,
    "originalLength": 1500,
    "mongoId": "ObjectId",
    "supabaseId": 1,
    "aiPowered": true,
    "optimizedMode": true
  }
}
```

### `GET /api/summarize`
Retrieves all summaries from Supabase.

### `GET /api/health`
Health check endpoint to test database and AI service connections.

**Response:**
```json
{
  "success": true,
  "connections": {
    "mongodb": true,
    "supabase": true,
    "gemini": true
  },
  "status": "healthy",
  "services": {
    "mongodb": "connected",
    "supabase": "connected",
    "gemini": "connected"
  }
}
```

### `POST /api/test-gemini`
Test individual Gemini AI functions.

**Request Body:**
```json
{
  "action": "summarize", // or "translate" or "combined"
  "text": "Your text content here"
}
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── summarize/route.ts    # Main API endpoint
│   │   ├── health/route.ts       # Health check with AI status
│   │   └── test-gemini/route.ts  # Gemini AI testing endpoint
│   ├── page.tsx                  # Main UI component (AI-enhanced)
│   └── layout.tsx               # App layout
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   ├── supabase.ts              # Supabase client
│   ├── scraper.ts               # Web scraping logic
│   ├── summarizer.ts            # AI/static summarization logic
│   ├── translator.ts            # AI/dictionary translation
│   ├── gemini.ts                # Google Gemini AI service
│   └── database.ts              # Database operations
├── database/
│   └── supabase_setup.sql       # Database schema
├── .env.example                 # Environment variables template
└── README.md
```

---

## 🔄 How It Works

1. **Input**: User enters a blog URL
2. **Scraping**: System extracts title and content using Cheerio
3. **AI Processing**: 
   - **Primary**: Google Gemini AI generates intelligent summaries and translations
   - **Fallback**: Static logic for reliability
4. **Optimization**: Combined operations for faster processing
5. **Storage**: 
   - Full content → MongoDB
   - Summary → Supabase
6. **Display**: Results shown in the AI-enhanced UI

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini AI
- **Databases**: MongoDB, Supabase
- **Scraping**: Cheerio, Axios
- **Language**: TypeScript

---

## 🚀 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🔍 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Test Gemini AI Functions
```bash
# Test summarization
curl -X POST http://localhost:3000/api/test-gemini \
  -H "Content-Type: application/json" \
  -d '{"action": "summarize", "text": "Your blog content here"}'

# Test translation
curl -X POST http://localhost:3000/api/test-gemini \
  -H "Content-Type: application/json" \
  -d '{"action": "translate", "text": "Hello world"}'

# Test combined operation
curl -X POST http://localhost:3000/api/test-gemini \
  -H "Content-Type: application/json" \
  -d '{"action": "combined", "text": "Your blog content here"}'
```

---

## ⚠️ Current Limitations

- Web scraping may fail on complex sites
- Basic error handling for edge cases
- No authentication system
- Limited web scraping compatibility

---

## 🔮 Future Enhancements

- ✅ ~~Integrate with proper AI APIs for better summarization~~ (DONE: Gemini AI)
- Advanced web scraping with JavaScript rendering
- User authentication and history
- Multiple language support
- Batch processing capabilities
- Real-time summarization
- Enhanced error handling and retry mechanisms
- Add more comprehensive Urdu translation
- Implement user authentication
- Add summary history and management
- Improve web scraping for different website structures
- Add support for multiple languages

---

## 👨‍💻 Author

**Asad Ur Rehman**  
BS Computer Science, FAST NUCES Karachi 
🌐 Connect: [www.linkedin.com/in/asad-ur-rehman-5b8112267](https://www.linkedin.com/in/asad-ur-rehman-5b8112267/)  
💬 Passionate about clean UI, purposeful tech, and continuous learning  

> _“Persistence outshines short bursts — even the smallest daily steps can create unstoppable momentum over time..”_
