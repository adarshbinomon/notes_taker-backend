require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(
  cors({
    origin: "*",
  })
);

// Import and use routes
const routes = require("./routes/routes.js");
app.use("/", routes);

// Start the server
app.listen(8000, () => console.log("Server running on port 8000"));

// Export the app for use in other modules or for testing
module.exports = app;
