const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');

const ALLOWED_ADMIN = 'Tradersnationacadamy@gmail.com';

// POST — Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Strict Email Locking
    if (!email || email.toLowerCase() !== ALLOWED_ADMIN.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Access Denied. Restricted to Authorized Master Account.' });
    }

    let admin = await Admin.findOne({ email: email.toLowerCase() });
    
    // Auto-Initialization for Master Account
    if (!admin && email.toLowerCase() === ALLOWED_ADMIN.toLowerCase()) {
      admin = await Admin.create({ 
        email: email.toLowerCase(), 
        mobile: '9876543210' // Default system signature
      });
      console.log(`✅ System initialized for: ${ALLOWED_ADMIN}`);
    }

    if (!admin) {
      return res.status(404).json({ success: false, error: 'System Signature Not Linked to Current Node.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    await admin.save();

    // Send OTP via Email
    await sendEmail({
      email: admin.email,
      subject: 'Security Terminal Verification Key',
      message: `Your dynamic security key is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0c111d; color: #ffffff; padding: 40px; text-align: center; border-radius: 20px; border: 1px solid #1e293b;">
          <h1 style="color: #3b82f6; font-size: 24px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">ADMIN VERIFICATION</h1>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Your secure access key for the Trader Nation terminal.</p>
          <div style="background-color: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #3b82f6; display: inline-block; margin-bottom: 30px;">
            <span style="font-size: 36px; font-weight: 900; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #475569; font-size: 11px;">Verification key expires in 5 minutes. If you did not initiate this request, please contact system intelligence immediately.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Verification key dispatched to secure email link.' });

  } catch (err) {
    console.error('Mail Error:', err);
    res.status(500).json({ success: false, error: 'Could not dispatch security key. Please try later.' });
  }
});

// POST — Verify OTP + return JWT token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Strict Email Locking
    if (!email || email.toLowerCase() !== ALLOWED_ADMIN.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Restricted Access Core. Deployment Rejected.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin signature lost in database.' });
    }

    console.log(`[AUTH] Verifying Node: ${email.toLowerCase()}`);
    console.log(`[DEBUG] Key Sequence: Stored[${admin.otp}] vs Received[${otp}]`);

    if (String(admin.otp) !== String(otp)) {
      console.warn(`[FAILED] Key mismatch for: ${email}`);
      return res.status(400).json({ success: false, error: 'Invalid OTP Signature. Please retry with the latest dispatched key.' });
    }

    console.log(`[SUCCESS] Access Granted: ${email}`);

    // Clear OTP after verification
    admin.otp = null;
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({ success: true, message: 'Login successful', token });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;