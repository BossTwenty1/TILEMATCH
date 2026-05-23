const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../config/db');

const router = express.Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const logContactMessage = async ({ name, email, phone, subject, message }, status) => {
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    '',
    message
  ].filter(Boolean).join('\n');

  try {
    await db.execute(
      'INSERT INTO email_logs (recipient, subject, body, status, sent_at) VALUES (?, ?, ?, ?, ?)',
      [process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'support@tilematch.com', subject, body, status, status === 'Sent' ? new Date() : null]
    );
  } catch (err) {
    console.error('Contact email log error:', err.message);
  }
};

router.post('/', async (req, res) => {
  try {
    const {
      name = '',
      email = '',
      phone = '',
      subject = '',
      message = ''
    } = req.body;

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim()
    };

    if (!trimmed.name || !trimmed.email || !trimmed.subject || !trimmed.message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    if (!isValidEmail(trimmed.email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (!emailConfigured) {
      await logContactMessage(trimmed, 'Pending');
      return res.status(202).json({
        message: 'Thanks for reaching out. Your message was saved and our team will respond shortly.'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"TileMatch Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      replyTo: trimmed.email,
      subject: `TileMatch inquiry: ${trimmed.subject}`,
      text: [
        `Name: ${trimmed.name}`,
        `Email: ${trimmed.email}`,
        trimmed.phone ? `Phone: ${trimmed.phone}` : null,
        '',
        trimmed.message
      ].filter(Boolean).join('\n')
    });

    await logContactMessage(trimmed, 'Sent');

    res.json({ message: 'Message sent successfully. Our TileMatch team will get back to you soon.' });
  } catch (err) {
    console.error('Contact form error:', err);
    await logContactMessage(req.body || {}, 'Failed');
    res.status(500).json({ error: 'Unable to send your message right now. Please try again later.' });
  }
});

module.exports = router;
