import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateFreightDto {
  @ApiProperty({
    description: 'ID del usuario que crea el flete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  createdByUserId: string;

  @ApiProperty({
    description: 'ID de la ubicacion inicial del flete',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  locationId?: number;

  @ApiProperty({
    description: 'Ciudad de origen del flete',
    example: 'CUCUTA',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80)
  originCity: string;

  @ApiProperty({
    description: 'Ciudad de destino del flete',
    example: 'BOGOTA',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80)
  destinationCity: string;
}
