import { Transform } from "class-transformer";
import { IsString, MinLength, MaxLength } from "class-validator";

export class SendMessageDto {
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @MinLength(1)
    @MaxLength(6000)
    text!: string;
}
