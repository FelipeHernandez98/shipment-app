import { ApiProperty } from '@nestjs/swagger';

export class FreightConsolidatedPdfResponseDto {
  @ApiProperty({
    description: 'ID del flete',
    example: '550e8400-e29b-41d4-a716-446655440099',
  })
  freightId: string;

  @ApiProperty({
    description: 'Ruta del PDF consolidado en storage',
    example: 'shipments/freights/2026/03/uuid/consolidated-1710632000.pdf',
  })
  pdfPath: string;

  @ApiProperty({
    description: 'Total de paginas generado (1 portada + N envios)',
    example: 101,
  })
  totalPages: number;
}
