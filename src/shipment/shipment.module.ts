import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { Shipment } from './entities/shipment.entity';
import { TrackingSequence } from './entities/tracking-sequence.entity';
import { TrackingSequenceService } from './tracking-sequence.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, TrackingSequence])],
  controllers: [ShipmentController],
  providers: [ShipmentService, TrackingSequenceService],
})
export class ShipmentModule {}
