import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { messages } = req.body;

    const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: messages,
    });

    res.json({
        response: aiResponse.text,
    });
});

app.get("/chat", (req, res) => {
    res.json({
        response: "Hello from the backend!",
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
