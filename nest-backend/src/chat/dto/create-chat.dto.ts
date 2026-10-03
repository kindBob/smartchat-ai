import { IsNotEmpty, IsString } from "class-validator";

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    title: string;
}
