import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import GoogleGenerativeAI from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Generative AI client
const aiClient = new GoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// POST API to generate emails
app.post('/generate-email', async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  // Validate input
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
    // Generate email using Gemini AI
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash', // Latest Gemini model
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
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
