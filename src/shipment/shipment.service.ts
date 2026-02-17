import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingSequenceService } from './tracking-sequence.service';

@Injectable()
export class ShipmentService {

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    private readonly trackingSequenceService: TrackingSequenceService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    const trackingCode = await this.trackingSequenceService.generateTrackingCode();

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingCode,
      sendDate: new Date(),
    });
    return this.shipmentRepository.save(shipment);
  }

  findAll() {
    return `This action returns all shipment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shipment`;
  }

  update(id: number, updateShipmentDto: UpdateShipmentDto) {
    return `This action updates a #${id} shipment`;
  }

  remove(id: number) {
    return `This action removes a #${id} shipment`;
  }
}
