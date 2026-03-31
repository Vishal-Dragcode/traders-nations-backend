const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Root Route & Health Check (Crucial for Render Deployment)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Trader Nation Backend API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    db_status: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Routes
app.use("/api/reviews", require("./routes/reviewRoute"));
app.use("/api/contact", require("./routes/contactRoute"));
app.use("/api/enroll", require("./routes/enrollementRoute"));
app.use('/api/events', require('./routes/eventRoute'));
app.use('/api/admin', require('./routes/adminRoute'));

// Start Server Immediately (Prevents Render Port Binding Errors)
app.listen(PORT, () => {
  console.log(`🚀 Server initialized and listening on port ${PORT}`);
  console.log("📂 Environment: " + (process.env.NODE_ENV || "development"));
});

// MongoDB Connection (Background Process)
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  
  if (!mongoURI) {
    console.error("❌ CRITICAL ERROR: MONGO_URI is missing from Environment Variables!");
    console.error("💡 FIX: Go to Render Dashboard -> Environment -> Add Variable 'MONGO_URI'");
    // We don't necessarily want to kill the process if we want the health routes to stay up
    // but without DB most things will fail.
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB Runtime Error: ${err.message}`);
    });

  } catch (err) {
    console.error(`❌ Connection Error: ${err.message}`);
    console.error("💡 HINT: Check if Render IPs are whitelisted in MongoDB Atlas (add 0.0.0.0/0 for testing).");
    // Don't exit(1) immediately to allow Render to see the app started
  }
};

connectDB();

