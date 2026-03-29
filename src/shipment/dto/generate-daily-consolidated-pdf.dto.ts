import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GenerateDailyConsolidatedPdfDto {
  @ApiProperty({
    description: 'Fecha del consolidado (formato YYYY-MM-DD)',
    example: '2026-03-24',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'Ciudad origen para filtrar los despachos',
    example: 'CÚCUTA',
    required: false,
  })
  @IsOptional()
  originCity?: string;
}
