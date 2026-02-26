import { IsDefined, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {

    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'juanperez'
    })
    @IsString()
    @IsDefined()
    username: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'Password123!',
        minLength: 8,
        maxLength: 20
    })
    @IsString()
    @IsDefined()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    password: string;
}