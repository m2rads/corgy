# AR AI Dog Application

This project creates an augmented reality experience with an AI-powered dog using WebXR, Three.js, and large language model (LLM) integration. The dog behaves naturally and responds to user interactions, powered by an LLM API (either OpenAI/ChatGPT or Anthropic/Claude).

## Features

- Web-based AR experience (no app download required)
- 3D dog model with basic animations
- Surface detection to place the dog in the real world
- Voice/text interaction with the dog
- Pet and play interactions
- LLM-powered behavior system
- Cross-platform (works on iOS and Android)

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **3D Rendering**: Three.js
- **AR Technology**: WebXR API
- **AI Integration**: OpenAI/ChatGPT or Anthropic/Claude API
- **Backend**: Express.js for API proxy

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- An API key from OpenAI or Anthropic
- A modern smartphone with AR capabilities and a recent browser

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install express cors axios dotenv
```

3. Create a `.env` file with your API keys:
```
# Choose which LLM provider to use
LLM_PROVIDER=openai  # or "anthropic"

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

PORT=3000
```

4. Start the server:
```
node server.js
```

### Frontend Setup

1. Host the HTML file on a secure server (HTTPS is required for WebXR)
   - You can use services like Netlify, Vercel, or GitHub Pages
   - For local development, tools like `ngrok` can provide temporary HTTPS URLs

2. Update the backend URL in the `callLLMAPI` function to point to your server.

3. For better performance, replace the placeholder dog model with a proper GLTF model.

## Usage

1. Open the application on a compatible AR device (modern smartphone)
2. Grant camera permissions when prompted
3. Click "Start AR" to begin the AR experience
4. Move your phone around to find a suitable surface
5. When a surface is detected, place the dog in your environment
6. Interact with the dog using the buttons at the bottom of the screen

## Customization Options

### Dog Model

Replace the primitive-based dog model with a better 3D model:

```javascript
// In loadDogModel function
const loader = new THREE.GLTFLoader();
loader.load('path/to/dog-model.glb')
```