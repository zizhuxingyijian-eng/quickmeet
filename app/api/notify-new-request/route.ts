// app/api/notify-new-request/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      toEmail,
      toName,
      fromEmail,
      fromName,
      date,
      startTime,
      durationMinutes,
      place,
      note,
    } = body;

    if (!toEmail) {
      return NextResponse.json(
        { error: "Missing toEmail" },
        { status: 400 }
      );
    }

    const subject = `New QuickMeet request from ${fromName || fromEmail}`;

    const textLines = [
      `Hi ${toName || "there"},`,
      "",
      `${fromName || fromEmail} just sent you a QuickMeet request.`,
      "",
      `Date: ${date}`,
      `Time: ${startTime} (${durationMinutes} min)`,
      `Place: ${place}`,
      note ? "" : undefined,
      note ? `Message: ${note}` : undefined,
      "",
      `You can view and respond on QuickMeet:`,
      `- Inbox: https://quickmeet-two.vercel.app/inbox`,
      "",
      `— QuickMeet`,
    ].filter(Boolean) as string[];

    await resend.emails.send({
  from: "QuickMeet · Lettermeet <goodday@lettermeet.cafe>",
  to: [toEmail],
  subject,
  text: textLines.join("\n"),
});


    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-new-request error", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
