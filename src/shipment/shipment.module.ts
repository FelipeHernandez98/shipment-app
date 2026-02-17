import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { Shipment } from './entities/shipment.entity';
import { TrackingSequence } from './entities/tracking-sequence.entity';
import { TrackingSequenceService } from './tracking-sequence.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, TrackingSequence]), PassportModule],
  controllers: [ShipmentController],
  providers: [ShipmentService, TrackingSequenceService],
})
export class ShipmentModule {}
