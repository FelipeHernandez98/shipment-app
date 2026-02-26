import { IsString, IsUUID, IsDateString, IsNumber, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipmentDto {

  @ApiProperty({
    description: 'ID del remitente (cliente)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  remitterId: string;

  @ApiProperty({
    description: 'ID del destinatario (cliente)',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    description: 'ID del usuario que crea el envío',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Descripción del paquete',
    example: 'Paquete con documentos importantes',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  packageDescription: string;

}
