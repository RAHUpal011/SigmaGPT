import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/upload.js";
import imageRoutes from "./routes/image.js";
import convertRoutes from "./routes/convert.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api" , chatRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/api/convert", convertRoutes);
app.use("/api/image", imageRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, ()=>{
    console.log(`server running on ${PORT}`);
    connectDB();
});

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("connected with DataBase");
    }catch(err){
        console.log("Failed to connect with Db" ,err);
    }
}

app.post("/test", async (req, res) => {

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: req.body.message
                }
            ]
        })
    };

    try {

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            options
        );

        const data = await response.json();

        console.log(data);

        res.json(data);

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: err.message });

    }

});













// import OpenAI from 'openai';
// import 'dotenv/config';
// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
// });

// const response = await client.responses.create({
//   model: 'gpt-40-mini',
//   input: 'difference between sql and Nosql',
// });

// console.log(response.output_text);