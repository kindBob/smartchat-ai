# SmartChat AI

A modern AI chat application built with React, TypeScript, NestJS, and Google Gemini.

## Features

* Multiple conversations
* Create, rename, and delete chats
* Persistent chats with LocalStorage
* AI-generated chat titles
* Stop response generation
* Retry failed responses
* Responsive design with mobile sidebar
* API error handling
* Message timestamps

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* SCSS

**Backend**

* NestJS
* Google Gemini API
* class-validator

## Project Structure

```text
SmartChat
├── frontend/    # React application
└── backend/     # NestJS API
```

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key
PORT=3001
```

## Status

🚧 **In development**
