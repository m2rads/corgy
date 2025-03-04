// server.js - A simple Express server to proxy LLM API requests
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
});