// app/api/notify-new-request/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
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
      siteUrl,
    } = body;

    if (!toEmail) {
      return NextResponse.json(
        { error: "Missing toEmail" },
        { status: 400 }
      );
    }

    const baseUrl = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin || "")
      .trim()
      .replace(/\/+$/, "");
    const inboxUrl = `${baseUrl}/inbox`;

    const moodLines = [
      "If there is a small pause in the day, we could meet.",
      "Some thoughts travel better face to face.",
      "If it suits you, a brief meeting would be enough.",
      "Small matters do not need long deliberation.",
      "One line is rarely the whole story.",
      "If a few words feel thin, a meeting can hold more.",
      "An easy meeting is sometimes the clearest reply.",
      "A quiet talk can be lighter than a long thread.",
      "If the time is kind, let us meet once.",
      "A short meeting can say what messages cannot.",
      "Between notes, a meeting can be gentle.",
      "If your day allows, we could meet without fuss.",
      "Some things are simpler in person.",
      "A face-to-face moment can be the softest answer.",
      "When a thought lingers, a meeting clears it.",
      "If we meet once, the rest may be easier.",
      "A brief meeting is sometimes the cleanest way.",
      "If it is not a burden, a meeting would be good.",
      "One meeting can spare many messages.",
      "A quiet meeting can carry more than a long note.",
    ];
    const moodLine =
      moodLines[Math.floor(Math.random() * moodLines.length)];

    const subject = `LetterMeet Note from ${fromEmail || fromName}`;

    const textLines = [
      `LetterMeet Note`,
      `A new request has arrived.`,
      ``,
      `Dear ${toName || toEmail},`,
      "",
      `You have received a new LetterMeet request.`,
      moodLine,
      "",
      `Date: ${date}`,
      `Time: ${startTime} (${durationMinutes} min)`,
      `Place: ${place}`,
      note ? "" : undefined,
      note ? `Message: ${note}` : undefined,
      ``,
      `Open and reply on LetterMeet:`,
      `Inbox: ${inboxUrl}`,
      note ? "" : undefined,
      "",
      `— LetterMeet`,
    ].filter(Boolean) as string[];

    const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background:#e9eef1; color:#1f1f1f;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e9eef1; padding:36px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#ffffff; border:1px solid #d6dbe0; box-shadow:0 12px 24px rgba(31, 43, 58, 0.08);">
            <tr>
              <td style="padding:28px 32px 16px;">
                <div style="font-family: Georgia, 'Times New Roman', serif; font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:#6c7884;">
                  LetterMeet Note
                </div>
                <div style="margin-top:10px; font-family: Georgia, 'Times New Roman', serif; font-size:22px; letter-spacing:0.02em; color:#1f2b3a;">
                  A new request has arrived.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 6px;">
                <div style="height:1px; background:#d6dbe0;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 18px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:14px; line-height:1.7; color:#1f1f1f;">
                <div style="font-size:15px;">Dear ${toName || toEmail},</div>
                <div style="margin-top:10px;">You have received a new LetterMeet request.</div>
                <div style="margin-top:10px; font-style: italic; color:#3b4954;">
                  ${moodLine}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 18px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #d6dbe0; background:#f7f9fb;">
                  <tr>
                    <td style="padding:14px 16px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:14px; line-height:1.6; color:#1f1f1f;">
                      <div style="font-family: Georgia, 'Times New Roman', serif; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#6c7884;">
                        Meeting Details
                      </div>
                      <div style="margin-top:8px;"><strong>Date:</strong> ${date}</div>
                      <div><strong>Time:</strong> ${startTime} (${durationMinutes} min)</div>
                      <div><strong>Place:</strong> ${place}</div>
                      ${note ? `<div style="margin-top:8px;"><strong>Message:</strong> ${note}</div>` : ""}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 12px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:14px; line-height:1.7;">
                <div>Open and reply on LetterMeet:</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <a href="${inboxUrl}" style="display:inline-block; background:#2a3a45; color:#f7f9fb; text-decoration:none; padding:10px 22px; border-radius:6px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:13px; letter-spacing:0.12em; text-transform:uppercase;">
                  Inbox
                </a>
                <div style="margin-top:10px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#6c7884;">
                  ${inboxUrl}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 26px; font-family: Georgia, 'Times New Roman', serif; font-size:14px; color:#1f2b3a;">
                — LetterMeet
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    await resend.emails.send({
      from: "Lettermeet <Goodday@lettermeet.cafe>",
      to: [toEmail],
      subject,
      text: textLines.join("\n"),
      html,
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
