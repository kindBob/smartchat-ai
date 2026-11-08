import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class GenerateTitleDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(6000)
    message: string;
}
