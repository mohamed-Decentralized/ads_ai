# AI Vibe Prototype - Project Memory

## Project Overview
This project is an MVP prototype for an AI Ad Creator, heavily inspired by [Vibe.co Studio](https://www.vibe.co/studio). 
The core functionality allows a user to paste a URL (e.g., a company website). The system scrapes the URL, analyzes the brand, and generates AI-powered advertisement content (both Images and Videos) based on that brand's identity.

## Tech Stack
*   **Frontend:** React + Vite (located in `/client`)
*   **Backend:** Node.js + Express (`server.js`)
*   **Deployment Target:** Must be able to function on the Oracle Cloud platform.

## API Architecture & Decisions

### 1. Text & Analysis (Google Gemini)
*   **Model:** `gemini-2.0-flash`
*   **Purpose:** Scraping website content via Jina.ai, analyzing brand guidelines, determining typography/colors, and writing optimized prompts for the visual models.
*   **Status:** Using the free tier API key from Google AI Studio.

### 2. Image & Video Generation (fal.ai)
*   **Models:** `fal-ai/flux/dev` (for Images) and `fal-ai/ltx-video` (for Videos).
*   **Decision History:** 
    *   Originally, Gemini was supposed to handle Image generation to save money. However, the Google free-tier quota for image models (`gemini-2.5-flash-image` and `imagen-4.0`) was restricted to 0 on the user's account.
    *   The user deposited $10 into fal.ai. Because fal.ai is so cost-effective, **both** Video and Image generation are now routed through fal.ai's endpoints in `server.js`.
*   **Cost Estimates:** ~$0.03 per video (LTX-Video) and ~$0.03 per image (FLUX.1).

## Key Files
*   `.env`: Contains `GEMINI_API_KEY`, `FAL_API_KEY`, and `PORT`.
*   `server.js`: The backend controller handling all AI routing. Contains functions like `generateImageWithFal` and `generateVideoAd`.
*   `client/src/App.jsx`: Main React component handling user inputs and displaying the generated ad media.

## Running the Project
From the root directory, run:
```bash
npm run dev
```
This uses `concurrently` to boot up the Node backend on `http://localhost:3000` and the Vite frontend on `http://localhost:5173`.
