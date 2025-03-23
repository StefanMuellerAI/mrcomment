import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Für __dirname in ES Modulen
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const RESEARCH_API_URL = process.env.RESEARCH_API_URL || 'http://localhost:8000';
const RESEARCH_API_KEY = process.env.RESEARCH_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Validate API key presence
if (!RESEARCH_API_KEY) {
  console.warn('WARNING: RESEARCH_API_KEY is not set in environment variables');
}

// Proxy for starting research
app.post('/api/research', async (req, res) => {
  try {
    const response = await axios.post(`${RESEARCH_API_URL}/research`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': RESEARCH_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying research request:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'Internal Server Error'
    });
  }
});

// Proxy for getting research status
app.get('/api/research/:id', async (req, res) => {
  try {
    const response = await axios.get(`${RESEARCH_API_URL}/research/${req.params.id}`, {
      headers: {
        'X-API-Key': RESEARCH_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying status request:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'Internal Server Error'
    });
  }
});

// Proxy for getting trend results
app.get('/api/research/:id/trends', async (req, res) => {
  try {
    const response = await axios.get(`${RESEARCH_API_URL}/research/${req.params.id}/trends`, {
      headers: {
        'X-API-Key': RESEARCH_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying trends request:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'Internal Server Error'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 