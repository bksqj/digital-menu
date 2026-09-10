const FROM = "Digital Menu <onboarding@resend.dev>";

/**
 * Plain fetch to Resend's REST API — no SDK dependency for one call site.
 * Swallows failures (returns false) rather than throwing: a broken email
 * send shouldn't surface as a 500 to someone requesting a password reset —
 * see the caller, which always shows the same generic success message
 * either way (no account-enumeration via error differences).
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping email send:", subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
