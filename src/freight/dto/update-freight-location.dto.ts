import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateFreightLocationDto {
  @ApiProperty({
    description: 'Nueva ubicacion para todos los envios del flete',
    example: 2,
  })
  @IsNumber()
  locationId: number;
}
