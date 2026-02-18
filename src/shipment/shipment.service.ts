import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingSequenceService } from './tracking-sequence.service';
import { StatusEnum } from 'src/commons/enums/status.enum';
import { CustomExceptions } from 'src/commons/exceptions/custom-exceptions';
import { UserService } from 'src/user/user.service';
import { ClientService } from 'src/client/client.service';
import { User } from 'src/user/entities/user.entity';
import { Roles } from 'src/commons/enums/roles.enum';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class ShipmentService {

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly trackingSequenceService: TrackingSequenceService,
    private readonly pdfService: PdfService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    await this.userService.findOne(createShipmentDto.userId);

    await this.clientService.findById(createShipmentDto.remitterId);

    await this.clientService.findById(createShipmentDto.recipientId);

    const trackingCode = await this.trackingSequenceService.generateTrackingCode();

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingCode,
      locationId: 0,
      statusId: StatusEnum.ACTIVE,
      sendDate: new Date(),
    });
    const savedShipment = await this.shipmentRepository.save(shipment);

    // Load relations for PDF
    const shipmentWithRelations = await this.shipmentRepository.findOne({
      where: { id: savedShipment.id },
      relations: ['remitter', 'recipient'],
    });

    // Generate PDF
    const pdfPath = await this.pdfService.generateShipmentGuide(shipmentWithRelations);
    savedShipment.pdfPath = pdfPath;
    await this.shipmentRepository.save(savedShipment);

    return savedShipment;
  }

  async findAll(): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      relations: ['remitter', 'recipient', 'user']
    });
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByTrackingCode(trackingCode: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingCode },
      relations: ['remitter', 'recipient', 'user']
    });
    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundByTrackingCodeException(trackingCode);
    }
    return shipment;
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } });
    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundException(id);
    }
    await this.shipmentRepository.update(id, {
      ...updateShipmentDto,
      updatedAt: new Date()
    });
    return this.shipmentRepository.findOne({
      where: { id },
      relations: ['remitter', 'recipient', 'user']
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.shipmentRepository.delete(id);
    if (result.affected === 0) {
      throw CustomExceptions.ShipmentNotFoundException(id);
    }
  }

  async findByUserId(userId: string, currentUser: User): Promise<Shipment[]> {
    if (currentUser.roleId !== Roles.administrator && currentUser.id !== userId) {
      throw CustomExceptions.UnauthorizedException();
    }

    const shipments = await this.shipmentRepository.find({
      where: { userId },
      relations: ['remitter', 'recipient', 'user']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByRemitterId(remitterId: string): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { remitterId },
      relations: ['remitter', 'recipient', 'user']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByRecipientId(recipientId: string): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { recipientId },
      relations: ['remitter', 'recipient', 'user']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByStatus(statusId: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { statusId },
      relations: ['remitter', 'recipient', 'user']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByLocation(locationId: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { locationId },
      relations: ['remitter', 'recipient', 'user']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async getPdfPath(id: string): Promise<string> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } });
    if (!shipment || !shipment.pdfPath) {
      throw CustomExceptions.PdfNotFoundException(id);
    }
    return shipment.pdfPath;
  }
}
