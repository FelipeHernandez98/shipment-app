import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AddShipmentsToFreightDto {
  @ApiProperty({
    description: 'Lista de IDs de envios a asociar al flete',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440010',
      '550e8400-e29b-41d4-a716-446655440011',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  shipmentIds: string[];
}
