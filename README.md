# Consultation Recording Manager

A complete production-style full-stack application for managing, uploading, and analyzing consultation recordings.

## Features
- **Authentication**: JWT-based secure authentication.
- **Recording Management**: Upload recordings directly to Cloudinary.
- **Notes & Tags**: Attach metadata to each recording.
- **Dashboard**: High-level statistics on recordings and storage.

## Tech Stack
**Frontend:**
- React, TypeScript, Vite
- Tailwind CSS
- React Query, React Router DOM

**Backend:**
- Node.js, Express.js, TypeScript
- Prisma ORM with PostgreSQL (Neon)
- Cloudinary for Media Storage

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (Neon)
- Cloudinary Account Credentials

### Environment Variables
**Backend (`backend/.env`)**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL="http://localhost:5000/api"
```

### Running Locally
1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment Instructions
- **Frontend (Vercel):** Connect your GitHub repo, set the Root Directory to `frontend`, set `VITE_API_URL` to your production backend URL, and click Deploy.
- **Backend (Render):** Create a Web Service, connect your GitHub repo, set the Root Directory to `backend`, set the Build Command to `npm install && npx prisma generate && npm run build`, set the Start Command to `npm start`. Ensure all ENV vars are added.
- **Database (Neon):** Neon provides a ready-to-use PostgreSQL connection string. Plug it into your Render ENV vars.

## API Design
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/recordings` - Get all recordings for the user
- `POST /api/recordings` - Upload a recording file (multipart/form-data)

## Future Improvements
- **AI Transcription**: Automatically transcribe uploaded audio using OpenAI Whisper.
- **Recording Summaries**: Generate brief summaries and action items using an LLM.
- **Role-Based Access Control**: Separate views for doctors, assistants, and patients.
- **Audit Logs**: Track who viewed or downloaded recordings.
- **Analytics Dashboard**: Weekly usage and patient engagement stats.
