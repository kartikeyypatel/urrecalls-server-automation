// urrecalls-backend/server.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// --- Twilio Client Initialization ---
// Ensure environment variables are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifySid) {
  console.error("🔴 Twilio credentials or Verify Service SID missing in .env file!");
  // process.exit(1); // Optionally exit if critical credentials missing
}
// Initialize only if credentials exist (or handle error appropriately)
const twilioClient = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for your app frontend
app.use(express.json()); // Enable parsing JSON request bodies

// --- API Routes ---

// Endpoint to send OTP
app.post('/api/send-twilio-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }
  if (!twilioClient || !verifySid) {
     return res.status(500).json({ success: false, error: 'Twilio client not initialized on server.' });
  }

  console.log(`Sending OTP to: ${phoneNumber}`);
  try {
    const verification = await twilioClient.verify.v2
      .services(verifySid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    console.log('Twilio Verification Status:', verification.status); // Should be 'pending'
    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error sending Twilio OTP:", error);
    // Provide a generic error or parse Twilio error code if needed
    res.status(500).json({ success: false, error: `Failed to send OTP: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to check OTP
app.post('/api/check-twilio-otp', async (req, res) => {
  const { phoneNumber, otpCode } = req.body;

  if (!phoneNumber || !otpCode) {
    return res.status(400).json({ success: false, error: 'Phone number and OTP code are required.' });
  }
   if (!twilioClient || !verifySid) {
     return res.status(500).json({ success: false, error: 'Twilio client not initialized on server.' });
  }

  console.log(`Checking OTP ${otpCode} for: ${phoneNumber}`);
  try {
    const check = await twilioClient.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phoneNumber, code: otpCode });

    console.log('Twilio Verification Check Status:', check.status); // 'approved' or 'pending' or 'canceled'

    if (check.status === 'approved') {
      res.status(200).json({ success: true, status: check.status });
    } else {
      // Status is pending (wrong code) or canceled (expired/max attempts)
      res.status(400).json({ success: false, status: check.status, error: 'Invalid or expired OTP code.' });
    }

  } catch (error) {
    console.error("Error checking Twilio OTP:", error);
    // Provide a generic error or parse Twilio error code if needed
    res.status(500).json({ success: false, error: `Failed to verify OTP: ${error.message || 'Unknown error'}` });
  }
});

// Basic root route (optional)
app.get('/', (req, res) => {
  res.send('Twilio Verify Backend is running!');
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🟢 Backend server listening on port ${port}`);
});