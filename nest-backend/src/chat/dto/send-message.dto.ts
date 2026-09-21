import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class PartDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    role: string;

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
