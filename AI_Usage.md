# AI Usage Declaration

This document describes all AI tools used during the development of the **Consultation Recording Manager** assignment, as required by the submission guidelines.

---

## Tool Used: OpenAI Whisper

**Purpose:** Audio-to-text transcription of consultation recordings.

**API Endpoint Used:**
```
POST https://api.openai.com/v1/audio/transcriptions
```

**Model:** `whisper-1`

**How it is used in this project:**

When a user uploads a consultation recording (audio or video file), the backend sends the file to the Whisper API. Whisper transcribes the spoken content and returns the text. This transcript is then stored in the database alongside the recording metadata and displayed to the user inside the recording player.

**Integration point in the codebase:**
- File: `backend/src/recording.routes.ts`
- Triggered inside the `POST /api/recordings` route, after the file is uploaded to Cloudinary
- The Cloudinary URL is used to download the file and forward it to the Whisper API
- The returned transcript text is saved in the `Recording.transcript` field via Prisma

**Why Whisper was chosen:**
- Highest transcription accuracy among available APIs, especially for medical terminology
- Supports Hindi, English, and code-switching (common in Indian medical consultations)
- Simple REST API — easy to integrate with an Express backend
- Cost-effective at $0.006 per minute of audio

**Data handling:**
- Audio files are sent to OpenAI's servers for transcription
- OpenAI does not use API data to train models (per their API data usage policy)
- Transcripts are stored in the project's own PostgreSQL database (Neon)
- No audio content is stored permanently on OpenAI servers

---

## Tool Used: GitHub Copilot / ChatGPT (Development Assistance)

**Purpose:** General coding assistance during development.

**Scope of use:**
- Boilerplate code suggestions (e.g. Express middleware patterns)
- Debugging TypeScript type errors
- Writing initial Zod validation schemas
- CSS layout assistance for the dashboard UI

**All code was reviewed, understood, and modified** by the developer before being included in the final submission. AI-generated suggestions that were used are integrated into the project's own logic and architecture.

---

## Summary Table

| AI Tool         | Purpose                          | Integration         |
|-----------------|----------------------------------|---------------------|
| OpenAI Whisper  | Audio → text transcription       | Backend API call    |
| GitHub Copilot  | Development coding assistance    | Development only    |

---

*This file was created as part of the assignment submission requirements.*
