import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { Freight } from './entities/freight.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { FreightTrackingSequence } from './entities/freight-tracking-sequence.entity';
import { UserModule } from '../user/user.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';
import { FreightTrackingSequenceService } from './freight-tracking-sequence.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Freight, Shipment, FreightTrackingSequence]),
    UserModule,
    PassportModule,
    PdfModule,
    StorageModule,
  ],
  controllers: [FreightController],
  providers: [FreightService, FreightTrackingSequenceService],
  exports: [FreightService],
})
export class FreightModule {}
