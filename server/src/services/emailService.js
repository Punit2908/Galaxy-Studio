import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

export function isEmailConfigured() {
  return Boolean(resend && process.env.RESEND_FROM && process.env.CONTACT_EMAIL)
}

export async function sendInquiryEmails(inquiry) {
  if (!isEmailConfigured()) {
    return { configured: false, sent: false }
  }

  const name = escapeHtml(inquiry.name)
  const email = escapeHtml(inquiry.email)
  const phone = escapeHtml(inquiry.phone || 'Not provided')
  const service = escapeHtml(inquiry.service || 'General enquiry')
  const message = escapeHtml(inquiry.message).replace(/\n/g, '<br />')

  const notification = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: [process.env.CONTACT_EMAIL],
    replyTo: inquiry.email,
    subject: `New enquiry from ${inquiry.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#25231f">
        <div style="padding:28px;background:#171614;color:#f4efe5">
          <div style="font-size:11px;letter-spacing:2px;color:#d8b86e">GALAXY PHOTOGRAPHY</div>
          <h1 style="margin:10px 0 0;font-size:28px;font-weight:500">New enquiry received</h1>
        </div>
        <div style="padding:28px;border:1px solid #e5dfd4">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <hr style="border:0;border-top:1px solid #e5dfd4;margin:24px 0" />
          <p style="white-space:normal;line-height:1.7">${message}</p>
          <p style="margin-top:26px"><a href="mailto:${email}" style="color:#a77d32">Reply to ${email}</a></p>
        </div>
      </div>
    `,
    text: `New enquiry from ${inquiry.name}\n\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'Not provided'}\nService: ${inquiry.service || 'General enquiry'}\n\nMessage:\n${inquiry.message}`,
  })

  const acknowledgement = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: [inquiry.email],
    replyTo: process.env.CONTACT_EMAIL,
    subject: 'We received your Galaxy Photography enquiry',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#25231f">
        <div style="padding:30px;background:#171614;color:#f4efe5">
          <div style="font-size:11px;letter-spacing:2px;color:#d8b86e">GALAXY PHOTOGRAPHY</div>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:500">Thank you, ${name}.</h1>
        </div>
        <div style="padding:30px;border:1px solid #e5dfd4;line-height:1.7">
          <p>We’ve received your enquiry and will get back to you as soon as possible.</p>
          <p><strong>Service:</strong> ${service}</p>
          <p style="color:#756f64">If your enquiry is time-sensitive, you can also reach us directly by phone or WhatsApp.</p>
        </div>
      </div>
    `,
    text: `Thank you, ${inquiry.name}.\n\nWe've received your Galaxy Photography enquiry and will get back to you as soon as possible.\n\nService: ${inquiry.service || 'General enquiry'}`,
  })

  return {
    configured: true,
    sent: Boolean(notification?.data?.id),
    notificationId: notification?.data?.id || null,
    acknowledgementId: acknowledgement?.data?.id || null,
  }
}
