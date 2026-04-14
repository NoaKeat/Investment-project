import nodemailer from "nodemailer";

export async function POST(req) {
  const body = await req.json();

  const { name, email, phone, message } = body;

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
    subject: "פנייה חדשה מהאתר",
    text: `
שם: ${name}
טלפון: ${phone}
אימייל: ${email}

הודעה:
${message}
    `,
  });

  return Response.json({ success: true });
}