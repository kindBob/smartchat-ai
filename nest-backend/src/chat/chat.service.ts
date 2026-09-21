import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;

    constructor(private readonly configService: ConfigService) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.get<string>("GEMINI_API_KEY"),
        });
    }

    async generateTitle(message: string) {
        const aiResponse = await this.ai.interactions.create({
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

        return aiResponse.output_text?.trim();
    }
}
