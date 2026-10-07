import { IsNotEmpty, IsString } from "class-validator";

export class UpdateChatDto {
    @IsString()
    @IsNotEmpty()
    title: string;
}
