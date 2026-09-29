# SmartChat AI

A modern AI chat application built with React, TypeScript, NestJS, and Google Gemini.

## Features

* Multiple conversations
* AI-generated chat titles
* Persistent chats with LocalStorage
* Create, rename, and delete chats
* Stop response generation
* Retry failed responses
* Responsive design
* Typing animation
* API rate limiting

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* SCSS
* Lucide React

### Backend

* NestJS
* TypeScript
* Google Gemini API
* Class Validator
* Throttler

## Architecture

```text
React + TypeScript
        |
        v
     REST API
        |
        v
   NestJS Backend
        |
        v
  Google Gemini API
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kindBob/smartchat-ai.git
cd smartchat-ai
```

### 2. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd nest-backend
npm install
```

### 3. Environment Variables

Create a `.env` file in the backend based on `.env.example`:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Add your Google Gemini API key to `GEMINI_API_KEY`.

### 4. Run the application

Start the backend:

```bash
cd nest-backend
npm run start:dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

## Deployment

* Frontend: Vercel
* Backend: Render
* AI: Google Gemini

## Author

Vladyslav Kostromin

GitHub: https://github.com/kindBob
