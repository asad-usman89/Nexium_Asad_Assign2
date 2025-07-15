# Blog Summarizer

A Next.js application that scrapes blog posts, generates summaries using static logic, translates to Urdu, and stores data in MongoDB and Supabase.

## Features

- **Web Scraping**: Extracts content from blog URLs using Cheerio
- **AI Summarization**: Generates summaries using static logic (sentence scoring)
- **Translation**: Translates summaries to Urdu using a dictionary-based approach
- **Database Integration**: 
  - MongoDB: Stores full blog content
  - Supabase: Stores summaries for quick access
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Setup Instructions

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

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/blog_summarizer

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## API Endpoints

### `POST /api/summarize`
Processes a blog URL and returns a summary.

**Request Body:**
```json
{
  "url": "https://example.com/blog-post"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Blog Post Title",
    "summary": "Generated summary...",
    "summaryUrdu": "Urdu translation...",
    "keyPoints": ["Point 1", "Point 2"],
    "wordCount": 150,
    "originalLength": 1500,
    "mongoId": "ObjectId",
    "supabaseId": 1
  }
}
```

### `GET /api/summarize`
Retrieves all summaries from Supabase.

### `GET /api/health`
Health check endpoint to test database connections.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── summarize/route.ts    # Main API endpoint
│   │   └── health/route.ts       # Health check
│   ├── page.tsx                  # Main UI component
│   └── layout.tsx               # App layout
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   ├── supabase.ts              # Supabase client
│   ├── scraper.ts               # Web scraping logic
│   ├── summarizer.ts            # AI summarization logic
│   ├── translator.ts            # Urdu translation
│   └── database.ts              # Database operations
├── database/
│   └── supabase_setup.sql       # Database schema
└── README.md
```

## How It Works

1. **Input**: User enters a blog URL
2. **Scraping**: System extracts title and content using Cheerio
3. **Summarization**: Static logic analyzes sentences and generates a summary
4. **Translation**: Dictionary-based translation to Urdu
5. **Storage**: 
   - Full content → MongoDB
   - Summary → Supabase
6. **Display**: Results shown in the UI

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databases**: MongoDB, Supabase
- **Scraping**: Cheerio, Axios
- **Language**: TypeScript

## Development

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

## Current Limitations

- Dictionary-based translation (limited vocabulary)
- Static summarization logic (no ML/AI)
- Basic error handling
- No authentication system
- Limited web scraping compatibility

## Future Enhancements

- Integrate with proper AI APIs for better summarization
- Add more comprehensive Urdu translation
- Implement user authentication
- Add summary history and management
- Improve web scraping for different website structures
- Add support for multiple languages
