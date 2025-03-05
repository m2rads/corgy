// server.js - A simple Express server to proxy LLM API requests
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware with more details
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`${req.method} ${req.url} [START] Headers: ${JSON.stringify(req.headers)}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} [FINISHED] ${res.statusCode} - ${duration}ms`);
  });
  
  res.on('error', error => {
    logger.error(`${req.method} ${req.url} [ERROR] ${error.message}`);
  });
  
  next();
});

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
  logger.info('Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Debug endpoint for AR capability detection - now with CORS explicitly enabled
app.get('/api/check-ar', (req, res) => {
  logger.info('AR capability check requested');
  // Set CORS headers explicitly for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  res.json({ 
    message: 'AR capability check endpoint reached',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    userAgent: req.get('User-Agent')
  });
});

// Endpoint to receive client logs - now with CORS explicitly enabled
app.post('/api/log', (req, res) => {
  // Set CORS headers explicitly for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const { message, type, userAgent, timestamp } = req.body;
  logger.info(`Client log [${type}]: ${message} (${userAgent})`);
  res.json({ received: true });
});

// LLM API endpoints
app.post('/api/llm', async (req, res) => {
  try {
    const { systemPrompt, messages, temperature = 0.7, max_tokens = 100 } = req.body;
    
    // Choose which LLM provider to use (OpenAI or Anthropic/Claude)
    const provider = process.env.LLM_PROVIDER || 'openai';
    
    let response;
    
    if (provider === 'anthropic') {
      // Claude API
      response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: "claude-3-haiku-20240307",
          system: systemPrompt,
          messages: messages,
          max_tokens: max_tokens,
          temperature: temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      return res.json({
        choices: [{
          message: {
            content: response.data.content[0].text
          }
        }]
      });
      
    } else {
      // OpenAI API
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];
      
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: formattedMessages,
          max_tokens: max_tokens,
          temperature: temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      return res.json(response.data);
    }
    
  } catch (error) {
    console.error('Error calling LLM API:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.response?.data || error.message
    });
  }
});

// Add a catchall route handler to log 404s
app.use((req, res) => {
  logger.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Dog behavior context management (optional)
const dogContexts = new Map();

// Store and retrieve dog behavior context
app.post('/api/dog-context/:id', (req, res) => {
  const { id } = req.params;
  const context = req.body;
  
  dogContexts.set(id, {
    ...context,
    lastUpdated: new Date()
  });
  
  res.json({ success: true });
});

app.get('/api/dog-context/:id', (req, res) => {
  const { id } = req.params;
  const context = dogContexts.get(id);
  
  if (context) {
    res.json(context);
  } else {
    res.status(404).json({ error: 'Context not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(`Server started on port ${port}`);
  logger.info(`Access via ngrok: check the ngrok dashboard for your public URL`);
});