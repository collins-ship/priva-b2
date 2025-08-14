const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// Admin allowed emails
const adminEmails = ["collinsokemwa47@gmail.com", "collinsokemwa08@gmail.com"];

// Monetization database (in memory for now)
let usageData = {};
let withdrawals = [];

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Priva API is running successfully!" });
});

// Middleware to check admin
function isAdmin(req, res, next) {
  const email = req.body.email;
  if (!email || !adminEmails.includes(email)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// Add usage
app.post("/admin/add-usage", isAdmin, (req, res) => {
  const { email, kbUsed } = req.body;
  if (!kbUsed || kbUsed <= 0) {
    return res.status(400).json({ error: "Invalid kbUsed" });
  }
  usageData[email] = (usageData[email] || 0) + kbUsed;
  res.json({ message: "Usage added", totalKB: usageData[email] });
});

// View stats
app.post("/admin/stats", isAdmin, (req, res) => {
  const { email } = req.body;
  const kbUsed = usageData[email] || 0;
  const usd = kbUsed * 100; // 1KB = 100 USD
  res.json({
    kbUsed,
    usd,
    withdrawals
  });
});

// Withdraw
app.post("/admin/withdraw", isAdmin, (req, res) => {
  const { email, amount, bankAccount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  withdrawals.push({ email, amount, bankAccount, date: new Date() });
  res.json({ message: "Withdrawal recorded", amount, bankAccount });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Priva API running on port ${PORT}`));
