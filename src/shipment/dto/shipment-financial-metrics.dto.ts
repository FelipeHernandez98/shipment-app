import { ApiProperty } from '@nestjs/swagger';

export class ShipmentMetricsPeriodDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 1 })
  month: number;

  @ApiProperty({ example: 'Enero 2026' })
  label: string;
}

export class ShipmentMetricsByStatusDto {
  @ApiProperty({ example: 2, description: 'Estado del envío (StatusEnum)' })
  statusId: number;

  @ApiProperty({ example: 50 })
  totalShipments: number;

  @ApiProperty({ example: 10250000 })
  totalAmount: number;
}

export class ShipmentFinancialMetricsDto {
  @ApiProperty({ type: ShipmentMetricsPeriodDto })
  period: ShipmentMetricsPeriodDto;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({ example: 128 })
  totalShipments: number;

  @ApiProperty({ example: 25480000 })
  totalAmount: number;

  @ApiProperty({ example: 199062.5 })
  averageTicket: number;

  @ApiProperty({ example: [1, 2, 4, 5], type: [Number] })
  countedStatuses: number[];

  @ApiProperty({ type: [ShipmentMetricsByStatusDto] })
  byStatus: ShipmentMetricsByStatusDto[];
}
