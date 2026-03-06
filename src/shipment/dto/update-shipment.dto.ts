import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShipmentDto {

  @ApiProperty({
    description: 'Descripción del paquete (opcional)',
    example: 'Paquete actualizado con documentos',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  packageDescription?: string;

  @ApiProperty({
    description: 'ID de la ubicación (opcional)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  locationId?: number;

  @ApiProperty({
    description: 'ID del estado (opcional)',
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({
    description: 'Valor declarado del envío (opcional)',
    example: '$150000 COP',
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shipmentValue?: string;
}
