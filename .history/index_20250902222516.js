import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { genai } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Gen AI client
const client = new genai.Client({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// POST API to generate email
app.post('/generate-email', async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  // Validate inputs
  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Build AI prompt
  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(', ')}
  `;

  try {
    // Generate email using Gemini AI model
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Use the latest available Gemini model
      contents: prompt,
    });

    // Send generated email back
    res.json({
      success: true,
      generatedEmail: response.text, // AI-generated email
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ success: false, message: 'Failed to generate email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
