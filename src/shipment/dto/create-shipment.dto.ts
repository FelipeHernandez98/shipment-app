import { IsString, IsUUID, IsDateString, IsNumber, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateShipmentDto {
  
  @IsUUID()
  remitterId: string;

  @IsUUID()
  recipientId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(100)
  packageDescription: string;

}
