# Multi-Tenant Agentic WhatsApp Orchestrator

An end-to-end cloud-native system for a Multi-Tenant WhatsApp AI Support & Sales Agent SaaS. 

This platform allows multiple companies (tenants) to manage customer queries interactively over WhatsApp. It leverages **LangGraph** to process incoming text and media inquiries, send rich responses (images and documents), toggle WhatsApp's native typing indicators to reduce user drop-offs, and stores all conversations in a multi-tenant **MongoDB** database.

## Architecture

### LangGraph Agent Pipeline
The core AI orchestration is built using a LangGraph state machine:
1. **Acknowledge Node**: Instantly fires off the "read receipt" and "typing indicator" via the WhatsApp Cloud API, and saves the message to the database state.
2. **Context Retriever Node**: Pulls the specific Tenant's prompt, media catalog rules, and the last 5 messages of chat history from MongoDB.
3. **LLM Reasoning Node**: Invokes Gemini (Google) to determine the next conversational step. The agent can decide to reply with plain text or use the `send_media_asset` tool to attach a document or image from the Tenant's media library. If frustration is detected, it flags the conversation as `NEEDS_HUMAN`.
4. **Dispatcher Node**: Constructs the appropriate WhatsApp payload, dispatches it, and records the outgoing response in the database, automatically extinguishing the typing indicator.

*(Webhook Inbound -> Acknowledge -> Context -> LLM Reasoning -> Dispatcher)*

### Async Webhook Handler
Built on **FastAPI**, the webhook returns a `200 OK` to Meta immediately upon receiving a message, preventing duplicate delivery retries. The LangGraph orchestration runs in a background task.

## Quick-Start Instructions

### 1. Environment Setup
Create a `.env` file in the `backend/` directory (see `backend/.env.example` for reference) with the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=whatsapp_agent

# Gemini AI Configuration
GOOGLE_API_KEY=your-gemini-key

# WhatsApp API Configuration
WHATSAPP_API_TOKEN=your-whatsapp-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WEBHOOK_VERIFY_TOKEN=my-secret-token-123
META_APP_SECRET=your-meta-app-secret
```

### 2. Run Local Environment
You will need two terminals to run the frontend and backend locally.

**Backend (FastAPI):**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on http://localhost:3000)*

### 3. Exposing Webhook (ngrok)
To allow Meta to send events to your local backend:
```bash
ngrok http 8000
```
Update your Meta App Webhook configuration to point to your ngrok URL `https://<your-id>.ngrok-free.app/api/webhook`.

## Deployment (GCP Cloud Run)

This project includes a multi-stage `Dockerfile` designed for deployment to **Google Cloud Run** as a single container.

1. **Build the container:**
   ```bash
   docker build -t whatsapp-orchestrator .
   ```
2. **Push to Artifact Registry:**
   ```bash
   docker tag whatsapp-orchestrator gcr.io/<PROJECT_ID>/whatsapp-orchestrator
   docker push gcr.io/<PROJECT_ID>/whatsapp-orchestrator
   ```
3. **Deploy to Cloud Run:**
   Deploy the image and pass the required environment variables using GCP Secret Manager.
   ```bash
   gcloud run deploy whatsapp-orchestrator \
     --image gcr.io/<PROJECT_ID>/whatsapp-orchestrator \
     --platform managed \
     --set-env-vars MONGODB_URI=...,DATABASE_NAME=whatsapp_agent,... \
     --allow-unauthenticated
   ```
4. Update your Meta Webhook URL to point to the live Cloud Run URL.

## Features
- **Multi-Tenant Architecture**: Strict data isolation between brands.
- **Cinematic Dashboard**: A "Liquid Glass" themed frontend monitor to audit conversations.
- **Agentic Rich Media**: Autonomous dispatching of PDFs and Images via Gemini tool calls.
- **Webhook Security**: `X-Hub-Signature-256` HMAC validation securing the inbound webhooks.
