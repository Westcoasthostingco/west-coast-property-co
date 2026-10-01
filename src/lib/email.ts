// Transactional email through Resend's REST API (no SDK). Silently no-ops when
// RESEND_API_KEY is not set so local and preview builds never send.
const FROM = process.env.EMAIL_FROM ?? "West Coast Hosting Co <hello@westcoasthostingco.com>";

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html, reply_to: replyTo }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

const wrap = (body: string) => `
<div style="font-family:Georgia,serif;color:#3a4448;max-width:560px;margin:0 auto;padding:32px 24px;background:#fbfdfc">
  <p style="font-family:Helvetica,Arial,sans-serif;letter-spacing:.28em;font-size:11px;color:#8fc0ce;margin:0">WEST COAST</p>
  <p style="font-style:italic;font-size:28px;color:#6ba8bc;margin:2px 0 24px">Hosting Co</p>
  ${body}
  <p style="font-size:13px;color:#6b777c;margin-top:32px">Christi &amp; Melissa · 253.278.6818 · 503.860.8115<br>hello@westcoasthostingco.com · Coast to Cascades</p>
</div>`;

export const bookingConfirmation = (o: { guest: string; property: string; checkIn: string; checkOut: string; guests: number; total: string; checkInTime: string }) =>
  wrap(`
  <p style="font-size:18px">Hi ${o.guest}, you're booked.</p>
  <p>We can't wait to host you at <strong>${o.property}</strong>.</p>
  <table style="font-family:Helvetica,Arial,sans-serif;font-size:14px;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:4px 16px 4px 0;color:#6b777c">Check in</td><td>${o.checkIn} after ${o.checkInTime}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b777c">Check out</td><td>${o.checkOut}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b777c">Guests</td><td>${o.guests}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b777c">Paid</td><td>${o.total}</td></tr>
  </table>
  <p>Door code, parking and our favorite local spots arrive a couple of days before you do. Reply to this email any time; it reaches us directly.</p>`);

export const contactNotification = (o: { name: string; email: string; kind: string; message: string }) =>
  wrap(`<p style="font-size:18px">New message from the website</p>
  <p><strong>${o.name}</strong> (${o.email}), ${o.kind}</p>
  <p style="white-space:pre-wrap;border-left:3px solid #a8d0dc;padding-left:12px">${o.message}</p>`);
