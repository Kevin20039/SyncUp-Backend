// index.js (or your main server file)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
dotenv.config({ path: './.env' });
// Route imports

const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");

console.log("MONGO_URI value is:", process.env.MONGO_URI); 

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

// MIDDLEWARE

// Explicitly configure CORS to trust your frontend's origin
app.use(cors({
    origin: "http://localhost:5173" 
}));

// server.js

// Increase the limit to 5 Gigabytes (adjust as needed)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Configure Helmet to allow cross-origin resource sharing
// This is the most important change!
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(morgan("common"));

// This line is crucial for serving images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Test route
app.get("/api/test", (req, res) => {
    res.status(200).json({ message: "Backend server is working!" });
});

// API routes
// Add these with your other API routes
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);

app.listen(8800, () => {
    console.log("Backend server is running on port 8800!");
});