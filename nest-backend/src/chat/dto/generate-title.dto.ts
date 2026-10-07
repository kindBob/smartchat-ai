import { IsNotEmpty, IsString } from "class-validator";

export class GenerateTitleDto {
    @IsString()
    @IsNotEmpty()
    chatId: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}
