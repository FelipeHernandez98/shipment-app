import { IsDefined, IsString, Matches, Max, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan',
        maxLength: 30
    })
    @IsString()
    @MaxLength(30)
    name: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez',
        maxLength: 30
    })
    @IsString()
    @MaxLength(30)
    lastname: string;

    @ApiProperty({
        description: 'Nombre de usuario único',
        example: 'juanperez',
        maxLength: 30
    })
    @IsString()
    @MaxLength(30)
    username: string;

    @ApiProperty({
        description: 'Número de teléfono',
        example: '1234567890',
        maxLength: 15
    })
    @IsString()
    @MaxLength(15)
    phoneNumber: string;

    @ApiProperty({
        description: 'Contraseña del usuario (mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial)',
        example: 'Password123!',
        minLength: 8,
        maxLength: 20
    })
    @IsString()
    @IsDefined()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    })
    password: string;

}
