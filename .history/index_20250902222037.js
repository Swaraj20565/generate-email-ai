import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GenAIClient } from "@google/generative-ai"; // AI client

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Gen AI client
const genAI = new GenAIClient({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

// POST API for generating email
app.post("/generate-email", async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Create prompt for AI
  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(", ")}
  `;

  try {
    const model = await genAI.getGenerativeModel("gemini-text-1"); // Get AI model
    const result = await model.generateText({
      prompt: prompt,
      maxOutputTokens: 300
    });

    res.json({
      success: true,
      generatedEmail: result.text // The AI-generated email
    });
  } catch (error) {
    console.error("Error generating email:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate email" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
