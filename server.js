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
  const mongoURI = process.env.MONGO_URI;
  
  if (!mongoURI) {
    console.error("❌ CRITICAL ERROR: MONGO_URI is missing. Make sure it is added as an Environment Variable on Render.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Listen to connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB Runtime Error: ${err.message}`);
    });

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error(`❌ Connection Error: ${err.message}`);
    console.error("💡 HINT: If you catch an 'IP not whitelisted' error, you must add 0.0.0.0/0 to your MongoDB Atlas Network Access.");
    process.exit(1);
  }
};

connectDB();
