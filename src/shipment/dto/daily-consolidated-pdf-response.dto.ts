import { ApiProperty } from '@nestjs/swagger';

export class DailyConsolidatedPdfResponseDto {
  @ApiProperty({
    description: 'Fecha del consolidado generado',
    example: '2026-03-24',
  })
  date: string;

  @ApiProperty({
    description: 'Cantidad de envios incluidos',
    example: 15,
  })
  totalShipments: number;

  @ApiProperty({
    description: 'Ruta local del PDF generado',
    example: 'uploads/pdfs/2026-03-24.pdf',
  })
  pdfPath: string;
}
