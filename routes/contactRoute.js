const express = require("express");
const router = express.Router();
const ContactUs = require("../models/ContactUs");
const protect = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

// 1. POST — Submit contact form
router.post("/", async (req, res) => {
  try {
    const contact = await ContactUs.create(req.body);

    // Notify Admin about NEW Contact Message
    try {
      await sendEmail({
        email: process.env.EMAIL_USER,
        subject: `[INQUIRY] ${contact.name}`,
        message: `${contact.name} has sent a message: ${contact.message}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; background: #0a0f1c; color: #fff; padding: 40px; border-radius: 20px;">
            <p style="text-transform: uppercase, letter-spacing: 2px, font-size: 10px, color: #475569">COMMUNICATION LINK ESTABLISHED</p>
            <h1 style="font-size: 24px, font-weight: 800">New Student Inquiry</h1>
            <div style="margin: 20px 0, padding: 20px, background: rgba(255,255,255,0.05), border-radius: 12px">
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Mobile:</strong> ${contact.mobile}</p>
              <p><strong>Message:</strong> ${contact.message}</p>
            </div>
          </div>
        `
      });
    } catch (err) {
      console.error('Inquiry notification failed:', err);
    }

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. GET ALL — Fetch all messages (admin)
router.get("/", async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. PUT — Update contact details (admin)
router.put("/:id", async (req, res) => {
  try {
    const { name, mobile, email, message } = req.body;
    const contact = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { name, mobile, email, message },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, error: "Contact not found" });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/:id/isread", async (req, res) => {
  try {
    // First find the message
    const message = await ContactUs.findById(req.params.id);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    // Toggle isRead
    message.isRead = !message.isRead;
    await message.save();

    res.status(200).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. DELETE — Delete a message (admin)
router.delete("/:id", async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndDelete(req.params.id);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
