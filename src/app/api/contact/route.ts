import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

// limits
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;
const MAX_PER_HOUR = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// clients
function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || "sarayu.dev";
  return createHash("sha256").update(salt + ip).digest("hex");
}

function getIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip")) || "unknown";
}

// turnstile
async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not set up yet, skip
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

// spam guess
function looksSpammy(message: string) {
  const links = (message.match(/https?:\/\//gi) || []).length;
  return links > 2;
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const company = String(payload.company ?? "");
  const token = payload.turnstileToken ? String(payload.turnstileToken) : undefined;

  // honeypot: pretend it worked
  if (company) return NextResponse.json({ ok: true });

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "That letter is a little too long." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const ip = getIp(req);
  if (!(await verifyTurnstile(token, ip))) {
    return NextResponse.json({ error: "Couldn't verify you're human. Try again." }, { status: 400 });
  }

  const db = supabase();
  if (!db) {
    console.error("contact: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { error: "Couldn't send right now. Try again later." },
      { status: 500 }
    );
  }

  // rate limit
  const ipHash = hashIp(ip);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return NextResponse.json(
      { error: "You've sent a few already. Try again in an hour." },
      { status: 429 }
    );
  }

  // save
  const status = looksSpammy(message) ? "spam" : "new";
  const { error: dbError } = await db.from("contact_messages").insert({
    name,
    email,
    message,
    status,
    ip_hash: ipHash,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });
  if (dbError) {
    console.error("contact insert failed", dbError);
    return NextResponse.json({ error: "Something went wrong, try again in a moment." }, { status: 500 });
  }

  // ping
  const notify = process.env.CONTACT_NOTIFY || "ping";
  if (status === "new" && notify !== "off" && process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const full = notify === "full";
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `[sarayu.dev] New letter from ${name}`,
        text: full
          ? `${name} <${email}>\n\n${message}`
          : `${name} sent you a letter. Read it in your Supabase inbox.\n\n${process.env.CONTACT_INBOX_URL || ""}`,
      });
    } catch (err) {
      console.error("resend ping failed", err); // message is already saved
    }
  }

  return NextResponse.json({ ok: true });
}