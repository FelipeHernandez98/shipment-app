import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class LoginResponseDto {
    @ApiProperty({
        description: 'Token JWT para autenticación',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    token: string;

    @ApiProperty({
        description: 'Información del usuario autenticado',
        type: () => User
    })
    user: any; // O importar User, pero para evitar circular, usar any o crear un UserResponseDto sin relaciones
}