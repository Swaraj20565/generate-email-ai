import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ named import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// -----------------------------
// POST /generate-email
// -----------------------------
app.post("/generate-email", async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  // Validate input
  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Build AI prompt dynamically
  const prompt = `
    Write a ${tone} ${emailType} email to a ${recipientType}.
    Subject: ${subject}
    Include these points: ${keyPoints.join(", ")}
  `;

  try {
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate the email content
    const result = await model.generateContent(prompt);

    // Extract the text response
    const generatedEmail = result.response.text();

    // Send JSON response
    res.json({
      success: true,
      generatedEmail,
    });
  } catch (error) {
    console.error("❌ Error generating email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate email",
    });
  }
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
