import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/upload.js";
import imageRoutes from "./routes/image.js";
import convertRoutes from "./routes/convert.js";
import threadRouter from "./routes/thread.js";
import chatRouter from "./routes/chat.js";
import chatRoutes from "./routes/chat.js";

const app = express();

const PORT = process.env.PORT || 8080;

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "https://sigma-gpt-ochre.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without origin
            // such as Postman/server-side requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("CORS blocked:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true
    })
);


// ===============================
// ROUTES
// ===============================

// Authentication
app.use("/api/auth", authRoutes);

// Threads
app.use("/api/thread", threadRouter);

// Chat
app.use("/api/chat", chatRouter);

// If your existing chatRoutes contains routes
// that expect /api/...
app.use("/api", chatRoutes);

// Upload
app.use("/api/upload", uploadRoutes);

// Conversion
app.use("/api/convert", convertRoutes);

// Image
app.use("/api/image", imageRoutes);

// Uploaded files
app.use(
    "/uploads",
    express.static("uploads")
);


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "SigmaGPT Backend is running 🚀"
    });

});


// ===============================
// DATABASE
// ===============================

const connectDB = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URL
        );

        console.log("connected with DataBase");

    } catch (err) {

        console.error(
            "Failed to connect with Db:",
            err
        );

    }

};


// ===============================
// START SERVER
// ===============================

app.listen(PORT, async () => {

    console.log(
        `server running on ${PORT}`
    );

    await connectDB();

});