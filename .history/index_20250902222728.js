import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import GoogleGenAI from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Gen AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

app.post('/generate-email', async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      generatedEmail: response.text,
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ success: false, message: 'Failed to generate email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
