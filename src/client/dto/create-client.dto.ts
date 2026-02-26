import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'María'
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Apellido del cliente',
        example: 'García'
    })
    @IsString()
    lastname: string;

    @ApiProperty({
        description: 'Tipo de documento',
        example: 'CC'
    })
    @IsString()
    documentType: string;

    @ApiProperty({
        description: 'Número de documento',
        example: '1234567890'
    })
    @IsString()
    documentNumber: string;

    @ApiProperty({
        description: 'Número de teléfono',
        example: '0987654321'
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        description: 'Dirección',
        example: 'Calle 123 #45-67'
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'Ciudad',
        example: 'Bogotá'
    })
    @IsString()
    city: string;

    @ApiProperty({
        description: 'Correo electrónico',
        example: 'maria.garcia@example.com'
    })
    @IsEmail()
    email: string;

}
