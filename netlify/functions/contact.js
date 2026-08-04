// Netlify Function: /.netlify/functions/contact
// Sends contact form submissions via Resend.
// Requires env vars set in Netlify: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { name, email, tour, dates, message } = data;
  if (!name || !email || !message) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL = process.env.CONTACT_TO_EMAIL;
  const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Mongol.Tours <onboarding@resend.dev>";

  if (!RESEND_API_KEY || !TO_EMAIL) {
    return { statusCode: 500, body: "Email service not configured" };
  }

  const escapeHtml = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
    <h2>New enquiry from Mongol.Tours</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${tour ? `<p><strong>Tour:</strong> ${escapeHtml(tour)}</p>` : ""}
    ${dates ? `<p><strong>Dates / group size:</strong> ${escapeHtml(dates)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New enquiry: ${name}${tour ? " — " + tour : ""}`,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return { statusCode: 502, body: "Failed to send email" };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Contact function error:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
