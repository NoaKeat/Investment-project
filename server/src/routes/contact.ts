// routes/contact.ts
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ולידציה בסיסית
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Message from ${name}`,
      text: message,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;