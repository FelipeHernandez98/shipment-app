import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ShipmentModule } from './shipment/shipment.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [AuthModule, UserModule, ShipmentModule, PdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
