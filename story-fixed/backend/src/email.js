// src/email.js — Nodemailer email service
import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderConfirmation({ to, order, items }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured — skipping order confirmation email');
    return;
  }
  const fp = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const itemRows = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.size} / ${i.color_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${fp(i.total_price)}</td>
    </tr>`).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;">
          <tr><td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
            <div style="color:#fff;font-size:28px;font-weight:300;letter-spacing:0.15em;">STORY™</div>
            <div style="color:#aaa;font-size:10px;letter-spacing:0.2em;margin-top:6px;">YOUR STYLE, YOUR STORY</div>
          </td></tr>
          <tr><td style="padding:36px 40px;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:400;color:#111;">Order Confirmed!</h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px;">Hi ${order.delivery_name || 'there'}, your order has been placed successfully.</p>
            <div style="background:#f9f9f9;border:1px solid #eee;padding:16px 20px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#888;font-size:12px;letter-spacing:0.1em;">ORDER NUMBER</span>
                <span style="font-weight:600;font-size:14px;">${order.order_number}</span>
              </div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;margin-bottom:24px;">
              <thead>
                <tr style="background:#f9f9f9;">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;color:#888;font-weight:400;">ITEM</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;color:#888;font-weight:400;">VARIANT</th>
                  <th style="padding:10px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;color:#888;font-weight:400;">QTY</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;color:#888;font-weight:400;">PRICE</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td style="padding:4px 0;color:#888;font-size:13px;">Subtotal</td><td style="padding:4px 0;text-align:right;font-size:13px;">${fp(order.subtotal)}</td></tr>
              ${order.discount_amount > 0 ? `<tr><td style="padding:4px 0;color:#16a34a;font-size:13px;">Discount (${order.coupon_code})</td><td style="padding:4px 0;text-align:right;color:#16a34a;font-size:13px;">-${fp(order.discount_amount)}</td></tr>` : ''}
              ${order.gst_amount > 0 ? `<tr><td style="padding:4px 0;color:#888;font-size:13px;">GST (18%)</td><td style="padding:4px 0;text-align:right;font-size:13px;">${fp(order.gst_amount)}</td></tr>` : ''}
              <tr><td style="padding:4px 0;color:#888;font-size:13px;">Shipping</td><td style="padding:4px 0;text-align:right;font-size:13px;">${order.shipping_cost > 0 ? fp(order.shipping_cost) : 'FREE'}</td></tr>
              <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
              <tr><td style="font-weight:600;font-size:15px;">Total</td><td style="font-weight:600;font-size:15px;text-align:right;">${fp(order.total)}</td></tr>
            </table>
            <div style="background:#f9f9f9;border:1px solid #eee;padding:16px 20px;">
              <div style="font-size:11px;letter-spacing:0.1em;color:#888;margin-bottom:8px;">DELIVERY ADDRESS</div>
              <div style="font-size:13px;color:#333;line-height:1.7;">${order.delivery_name}<br>${order.delivery_line1}${order.delivery_line2 ? ', ' + order.delivery_line2 : ''}<br>${order.delivery_city}, ${order.delivery_state} — ${order.delivery_pincode}</div>
            </div>
          </td></tr>
          <tr><td style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:11px;letter-spacing:0.05em;">Questions? Reply to this email or contact support.</p>
            <p style="margin:8px 0 0;color:#aaa;font-size:10px;">© 2025 STORY™. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await getTransporter().sendMail({
      from: `"STORY™" <${process.env.SMTP_USER}>`,
      to,
      subject: `Order Confirmed — ${order.order_number}`,
      html,
    });
    console.log(`[Email] Order confirmation sent to ${to}`);
  } catch (e) {
    console.error('[Email] Failed to send:', e.message);
  }
}

export async function sendPasswordResetEmail({ to, resetUrl, token }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured — dev token:', token);
    return;
  }
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
      <tr><td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;">
          <tr><td style="background:#0a0a0a;padding:28px 40px;text-align:center;">
            <div style="color:#fff;font-size:28px;font-weight:300;letter-spacing:0.15em;">STORY™</div>
          </td></tr>
          <tr><td style="padding:36px 40px;text-align:center;">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:400;">Reset Your Password</h2>
            <p style="color:#666;font-size:14px;margin:0 0 28px;">Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 32px;font-size:12px;letter-spacing:0.15em;text-decoration:none;">RESET PASSWORD →</a>
            <p style="color:#aaa;font-size:12px;margin:24px 0 0;">If you didn't request this, ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await getTransporter().sendMail({
      from: `"STORY™" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Reset your STORY™ password',
      html,
    });
  } catch (e) {
    console.error('[Email] Failed to send reset email:', e.message);
  }
}
