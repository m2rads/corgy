# AR AI Dog

A web-based AR experience with an AI-powered dog that responds to your interactions. Place a virtual dog in your real environment, talk to it, pet it, and play with it - all powered by large language models.

## What It Does

- Places a 3D dog in your real world using AR
- Dog responds to your voice/text using AI
- Pet the dog and throw a ball to play with it
- Works directly in your browser - no app download needed

## Quick Setup

### Requirements

- Node.js
- API key from OpenAI or Anthropic (Claude)
- Smartphone with AR support (modern iOS/Android)

### Installation

1. Clone this repo
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file:
   ```
   LLM_PROVIDER=openai  # or "anthropic"
   OPENAI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   PORT=3000
   ```
4. Make sure you have a 3D dog model:
   - Place a GLB/GLTF model file in the `/assets` folder
   - Default path is `/assets/corgy.glb`

### Running Locally

1. Start the server:
   ```
   node server.js
   ```
2. Access on your computer:
   ```
   http://localhost:3000
   ```

### Testing on Your Phone

WebXR requires HTTPS. Use ngrok to create a secure URL:

1. Install ngrok if needed:
   ```
   npm install -g ngrok
   ```
2. Create a tunnel (while your server is running):
   ```
   ngrok http 3000
   ```
3. Open the HTTPS URL (provided by ngrok) on your phone
4. Grant camera permissions when prompted

## Using the App

1. Click "Start AR"
2. Move your phone to scan for surfaces
3. Place your dog on a detected surface
4. Interact using the buttons:
   - Talk: Say something to your dog
   - Pet: Give your dog affection
   - Throw Ball: Play fetch

## Tech Stack

- Frontend: HTML/JS with Three.js and WebXR
- Backend: Express.js server
- AI: OpenAI/ChatGPT or Anthropic/Claude
- 3D: GLTF/GLB model with animations