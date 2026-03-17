import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { Shipment } from './entities/shipment.entity';
import { TrackingSequence } from './entities/tracking-sequence.entity';
import { TrackingSequenceService } from './tracking-sequence.service';
import { UserModule } from 'src/user/user.module';
import { ClientModule } from 'src/client/client.module';
import { PassportModule } from '@nestjs/passport';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from 'src/storage/storage.module';
import { Freight } from 'src/freight/entities/freight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, TrackingSequence, Freight]), UserModule, ClientModule, PassportModule, PdfModule, StorageModule],
  controllers: [ShipmentController],
  providers: [ShipmentService, TrackingSequenceService],
})
export class ShipmentModule {}
