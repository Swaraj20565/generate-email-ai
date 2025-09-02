import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Gen AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

app.post("/generate-email", async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(", ")}
  `;

  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call API
    const result = await model.generateContent(prompt);

    // Extract text
    const generatedText = result.response.text();

    res.json({
      success: true,
      generatedEmail: generatedText,
    });
  } catch (error) {
    console.error("Error generating email:", error);
    res.status(500).json({ success: false, message: "Failed to generate email" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
