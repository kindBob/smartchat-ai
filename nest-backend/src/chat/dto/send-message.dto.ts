import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MinLength, MaxLength } from "class-validator";

export class SendMessageDto {
    @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
    @IsString()
    @MinLength(1)
    @MaxLength(6000)
    text!: string;

    // Client-generated id that lets this request be stopped through the stop route
    @IsOptional()
    @IsUUID()
    requestId?: string;
}
