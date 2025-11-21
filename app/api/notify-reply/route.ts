// app/api/notify-reply/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("[notify-reply] incoming body:", body);

    const {
      toEmail,     // A 的邮箱（应该是这个）
      toName,
      fromEmail,   // B 的邮箱
      fromName,
      date,
      startTime,
      durationMinutes,
      place,
      note,
      status,      // accepted / rejected
    } = body;

    if (!toEmail) {
      console.error("[notify-reply] missing toEmail", body);
      return NextResponse.json(
        { error: "Missing toEmail in payload" },
        { status: 400 }
      );
    }

    const subject =
      status === "accepted"
        ? `Your QuickMeet request was accepted`
        : `Your QuickMeet request was declined`;

    const textLines = [
      `Hi ${toName || toEmail},`,
      ``,
      `${fromName || fromEmail || "They"} has ${status} your QuickMeet request.`,
      ``,
      date ? `📅 Date: ${date}` : undefined,
      startTime && durationMinutes
        ? `⏰ Time: ${startTime} (${durationMinutes} min)`
        : undefined,
      place ? `📍 Place: ${place}` : undefined,
      note ? "" : undefined,
      note ? `📝 Note: ${note}` : undefined,
      ``,
      `You can check the status in your Sent page:`,
      `- https://quickmeet-two.vercel.app/sent`,
      ``,
      `— QuickMeet`,
    ].filter(Boolean) as string[];

    console.log("[notify-reply] sending via Resend to:", toEmail);

    const result = await resend.emails.send({
      from: "QuickMeet <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      text: textLines.join("\n"),
    });

    console.log("[notify-reply] Resend result:", result);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-reply] error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
