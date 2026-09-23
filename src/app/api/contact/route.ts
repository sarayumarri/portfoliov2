import { Resend } from "resend";
import { NextResponse } from "next/server";

// This whole file only ever runs on the server, never in the visitor's
// browser, which is exactly why the API key below is safe to use here.
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation. Never trust data coming from the client.
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are all required." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing RESEND_API_KEY. Add it to .env.local and restart the dev server." },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      // resend.dev is Resend's shared testing address. It works immediately
      // with no setup, but only delivers to the email you signed up with.
      // Once you verify your own domain in the Resend dashboard, swap this
      // for something like "Sarayu's Site <hello@sarayu.dev>".
      from: "Sarayu's Site <onboarding@resend.dev>",
      to: ["YOUR_EMAIL_HERE@example.com"], // <-- put the inbox you want these to land in
      replyTo: email, // this is the reply-to trick: hit reply and it goes to them, not to resend.dev
      subject: `New note from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
