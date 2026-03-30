const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/reviews", require("./routes/reviewRoute"));
app.use("/api/contact", require("./routes/contactRoute"));
app.use("/api/enroll", require("./routes/enrollementRoute"));
app.use('/api/events', require('./routes/eventRoute'));
app.use('/api/admin', require('./routes/adminRoute'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Listen to connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB Runtime Error: ${err.message}`);
    });

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(`❌ Connection Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();
