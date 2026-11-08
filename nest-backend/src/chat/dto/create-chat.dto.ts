import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;
}
