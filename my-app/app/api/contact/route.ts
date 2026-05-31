import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

// Basic email format check
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "שם חסר" }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "כתובת מייל לא תקינה" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "הודעה חסרה" }, { status: 400 });
    }

    // Fail fast if server-side secrets are missing (misconfiguration guard)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      // from must be the authenticated account — Gmail ignores spoofed senders
      from: `"${name.trim()}" <${emailUser}>`,
      replyTo: email,
      to: emailUser,
      subject: "פנייה חדשה מהאתר",
      text: [
        `שם: ${name.trim()}`,
        `טלפון: ${phone?.trim() || "לא צוין"}`,
        `אימייל: ${email}`,
        "",
        "הודעה:",
        message.trim(),
      ].join("\n"),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "שליחת המייל נכשלה, אנא נסה שוב" }, { status: 500 });
  }
}
