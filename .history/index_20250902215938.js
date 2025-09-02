import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// POST API for generating email
app.post("/generate-email", async (req, res) => {
  const { emailType, recipientType, tone, subject, keyPoints } = req.body;

  // Basic validation
  if (!emailType || !recipientType || !tone || !subject || !keyPoints) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Your AI logic goes here
  // For now, we will just create a simple template
  const generatedEmail = `
  Dear ${recipientType},

  This is a ${tone} ${emailType} email regarding "${subject}".
  Key points:
  ${keyPoints.map((point, i) => `${i+1}. ${point}`).join("\n")}

  Regards,
  Your AI Email Generator
  `;

  res.json({ success: true, generatedEmail });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
