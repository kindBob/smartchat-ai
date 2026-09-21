import { Type } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class PartDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(["user", "model"])
    role: "user" | "model";

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PartDto)
    parts: PartDto[];
}

export class SendMessageDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];
}
