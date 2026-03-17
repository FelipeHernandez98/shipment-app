import { IsString, IsUUID, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipmentDto {

  @ApiProperty({
    description: 'ID del flete asociado (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440099',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  freightId?: string;

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

  @ApiProperty({
    description: 'Valor declarado del envío',
    example: '$150000 COP',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  shipmentValue: string;

}
