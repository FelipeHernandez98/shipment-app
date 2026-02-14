import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ShipmentModule } from './shipment/shipment.module';
import { PdfModule } from './pdf/pdf.module';
import { CommonsModule } from './commons/commons.module';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Client } from './client/entities/client.entity';
import { Shipment } from './shipment/entities/shipment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      schema: process.env.DB_SCHEMA,
      entities: [User, Client, Shipment],
      synchronize: true,
    }),
    UserModule, ShipmentModule, PdfModule, CommonsModule, ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
