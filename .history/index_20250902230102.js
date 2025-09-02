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

// app.post("/generate-email", async (req, res) => {
//   const { emailType, recipientType, tone, subject, keyPoints } = req.body;

//   // Validate input
//   if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
//     return res
//       .status(400)
//       .json({ success: false, message: "All fields are required" });
//   }

//   // Build AI prompt
//   const prompt = `
//     Write a ${tone} ${emailType} email to a ${recipientType}.
//     Subject: ${subject}
//     Include these points: ${keyPoints.join(", ")}
//   `;

//   try {
//     // Get model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Generate response
//     const result = await model.generateContent(prompt);

//     // Extract text
//     const generatedEmail = result.response.text();

//     res.json({
//       success: true,
//       generatedEmail,
//     });
//   } catch (error) {
//     console.error("Error generating email:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to generate email" });
//   }
// });
app.post("/api/ask", async (req, res) => {
  const { question, topK, tone, recipient, keyPoints } = req.body;
  if (!question) return res.status(400).json({ success: false, message: "Question required" });

  try {
    // Create embedding for vector search
    const queryEmbedding = await createEmbedding(question);
    const scored = vectorStore.map(doc => ({ ...doc, score: cosineSim(queryEmbedding, doc.embedding) }));
    scored.sort((a, b) => b.score - a.score);

    const topChunks = scored.slice(0, topK || 3);
    const context = topChunks.map(c => c.text).join("\n\n");

    // ----------- Dynamic prompt ---------
    let prompt = `Answer the following based only on this context:\n${context}\n\n`;
    prompt += `Question: ${question}\n`;

    if (tone) prompt += `Tone: ${tone}\n`;
    if (recipient) prompt += `Recipient: ${recipient}\n`;
    if (keyPoints && keyPoints.length) prompt += `Include key points: ${keyPoints.join(", ")}\n`;

    // ----------- Generate answer ---------
    let answer = "No answer generated";
    if (gemini) {
      const result = await gemini.generateContent(prompt);
      answer = result.response?.text()?.trim() || answer;
    } else {
      answer = context.slice(0, 1000) + (context.length > 1000 ? "..." : "");
    }

    res.json({
      success: true,
      answer,
      usedChunks: topChunks.map(c => ({ id: c.id, preview: c.text.slice(0, 100) }))
    });

  } catch (error) {
    console.error("❌ QA error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
