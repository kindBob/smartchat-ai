import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { MessageDto } from "./dto/send-message.dto.js";

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(private readonly configService: ConfigService) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.getOrThrow<string>("GEMINI_API_KEY"),
        });

        this.model = this.configService.getOrThrow<string>("GEMINI_MODEL");
    }

    async generateResponse(messages: MessageDto[]) {
        try {
            const aiResponse = await this.ai.models.generateContent({
                model: this.model,
                contents: messages,
            });

            return aiResponse.text?.trim();
        } catch (error) {
            console.error("Gemini API error: ", error);

            throw new InternalServerErrorException("Failed to generate AI response");
        }
    }

    async generateTitle(message: string) {
        try {
            const aiResponse = await this.ai.interactions.create({
                model: this.model,
                input: `Generate a short title for this message.
            Rules: 
            - Return only the title
            - No quotation marks
            - Max 5 words
            - Keep it concise
    
            Message: 
            ${message}`,
            });

            const title = aiResponse.output_text?.trim();

            if (!title) {
                throw new Error("Empty title returned");
            }

            return title;
        } catch (error) {
            console.error("Gemini API error: ", error);

            throw new InternalServerErrorException("Failed to generate title");
        }
    }
}
