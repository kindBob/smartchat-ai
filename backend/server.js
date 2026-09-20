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
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: "Messages must be an array",
            });
        }

        const aiResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: messages,
        });

        res.json({
            response: aiResponse.text.trim(),
        });
    } catch (error) {
        console.error("Response generation error" + error);

        res.status(500).json({
            error: "Failed to generate AI response",
        });
    }
});

app.post("/chat-title", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required",
            });
        }

        const aiResponse = await ai.interactions.create({
            model: "gemini-3.5-flash-lite",
            input: `Generate a short title for this message.
            Rules: 
            - Return only the title
            - No quotation marks
            - Max 5 words
            - Keep it concise

            Message: 
            ${message}`,
        });

        res.json({
            response: aiResponse.output_text.trim(),
        });
    } catch (error) {
        console.error("Title generation error" + error);

        res.status(500).json({
            error: "Failed to generate chat title",
        });
    }
});

app.get("/chat", (req, res) => {
    res.json({
        response: "Hello from the backend!",
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
