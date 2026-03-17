import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';
import { Freight } from './entities/freight.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { UserModule } from '../user/user.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Freight, Shipment]),
    UserModule,
    PassportModule,
    PdfModule,
    StorageModule,
  ],
  controllers: [FreightController],
  providers: [FreightService],
  exports: [FreightService],
})
export class FreightModule {}
