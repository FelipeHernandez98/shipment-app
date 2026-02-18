import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class UpdateShipmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  packageDescription?: string;

  @IsOptional()
  @IsNumber()
  locationId?: number;

  @IsOptional()
  @IsNumber()
  statusId?: number;
}
