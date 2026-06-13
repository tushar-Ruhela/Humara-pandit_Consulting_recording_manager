# Interview Explanation Notes

Use these points to explain the design and code architecture during your interview.

## 1. Why this Tech Stack?
- **Vite + React + TS**: Fast compilation, strict typing prevents runtime errors, and Vite gives an incredible developer experience.
- **Prisma + PostgreSQL**: Prisma provides type-safe database queries. Neon makes PostgreSQL serverless and incredibly fast to deploy without managing infrastructure.
- **Layered Architecture (Backend)**: Separating controllers, services, and repositories ensures that business logic is isolated from HTTP requests and database queries. This makes the code highly testable and scalable.

## 2. Code Structure (Human-Written Vibe)
- **Error Handling**: Explain how you built the `asyncHandler` utility. "Instead of wrapping every single controller in a try/catch block, I created an `asyncHandler` middleware to catch unresolved promises and pass them to my centralized `errorHandler`."
- **Validation**: Mention Zod. "I prefer defining schemas with Zod over manual validation because it gives me both runtime validation and static TypeScript inference."
- **Security**: Discuss rate limiting and Helmet. "For a production-grade app handling potential patient data, I added `express-rate-limit` to prevent brute force attacks on login and `helmet` to set secure HTTP headers."
- **File Uploads**: Explain the choice of Cloudinary. "Storing large video/audio files on the local server or database is an anti-pattern. I pipe the `multer` stream directly to Cloudinary using `multer-storage-cloudinary` to save bandwidth and keep the server stateless."

## 3. If They Ask About Scalability
- "Right now, it's a monolithic Express app. If the application grows—especially if we add heavy AI transcription tasks—I would extract the AI transcription into a background worker (like BullMQ + Redis) so it doesn't block the main Node.js event loop."
- "For the database, Prisma makes it easy to add connection pooling."

## 4. Answering 'What was the hardest part?'
- "Ensuring type safety across the entire stack. Making sure the frontend knows exactly what the backend API is returning. In the future, I might consider something like tRPC, but for now, strict interfaces and Zod validation do the job."
