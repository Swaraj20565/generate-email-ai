import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ named import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

app.post("/generate-email", async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  // Validate input
  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Build AI prompt
  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(", ")}
  `;

  try {
    // Get model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);

    // Extract text
    const generatedEmail = result.response.text();

    res.json({
      success: true,
      generatedEmail,
    });
  } catch (error) {
    console.error("Error generating email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate email" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
