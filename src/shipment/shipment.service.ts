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
import { PdfService } from '../pdf/pdf.service';
import { LocationsEnum } from 'src/commons/enums/locations.enum';
import { StorageService } from 'src/storage/storage.service';
import { ShipmentFinancialMetricsDto, ShipmentMetricsByStatusDto } from './dto/shipment-financial-metrics.dto';
import { Freight } from 'src/freight/entities/freight.entity';

@Injectable()
export class ShipmentService {
  private readonly currency = process.env.METRICS_CURRENCY ?? 'COP';
  private readonly countedStatuses = [
    StatusEnum.ACTIVE,
    StatusEnum.DELIVERED,
    StatusEnum.DELAYED,
    StatusEnum.PENDING,
  ];
  private readonly monthLabels = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly trackingSequenceService: TrackingSequenceService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    await this.userService.findOne(createShipmentDto.userId);

    await this.clientService.findById(createShipmentDto.remitterId);

    await this.clientService.findById(createShipmentDto.recipientId);

    if (createShipmentDto.freightId) {
      const freight = await this.freightRepository.findOne({
        where: { id: createShipmentDto.freightId },
      });

      if (!freight) {
        throw CustomExceptions.FreightNotFoundException(createShipmentDto.freightId);
      }
    }

    const trackingCode = await this.trackingSequenceService.generateTrackingCode();

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingCode,
      locationId: LocationsEnum.BODEGA_CUCUTA,
      statusId: StatusEnum.ACTIVE,
      sendDate: new Date(),
    });
    return this.shipmentRepository.save(shipment);
  }

  async generatePdfOnDemand(id: string): Promise<{
    shipmentId: string;
    pdfPath: string;
    generated: boolean;
  }> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['remitter', 'recipient'],
    });

    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundException(id);
    }

    if (shipment.pdfPath) {
      return {
        shipmentId: shipment.id,
        pdfPath: shipment.pdfPath,
        generated: false,
      };
    }

    const pdfPath = await this.pdfService.generateShipmentGuide(shipment);
    shipment.pdfPath = pdfPath;
    shipment.updatedAt = new Date();
    await this.shipmentRepository.save(shipment);

    return {
      shipmentId: shipment.id,
      pdfPath,
      generated: true,
    };
  }

  async findAll(): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      relations: ['remitter', 'recipient', 'user', 'freight'],
      order: {
        sendDate: 'DESC',
      },
    });
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByTrackingCode(trackingCode: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingCode },
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundByTrackingCodeException(trackingCode);
    }
    return shipment;
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['remitter', 'recipient', 'user', 'freight'],
    });

    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundException(id);
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
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } });
    if (!shipment) {
      throw CustomExceptions.ShipmentNotFoundException(id);
    }

    if (shipment.pdfPath) {
      const pdfObjectKey = this.normalizePdfObjectKey(shipment.pdfPath);
      if (pdfObjectKey) {
        await this.storageService.deleteObject(pdfObjectKey);
      }
    }

    const result = await this.shipmentRepository.delete(id);
    if (result.affected === 0) {
      throw CustomExceptions.ShipmentNotFoundException(id);
    }
  }

  private normalizePdfObjectKey(pdfPath: string): string {
    const normalizedPath = pdfPath.trim();
    if (!normalizedPath) {
      return '';
    }

    if (/^https?:\/\//i.test(normalizedPath)) {
      try {
        const { pathname } = new URL(normalizedPath);
        return decodeURIComponent(pathname).replace(/^\/+/, '');
      } catch {
        return '';
      }
    }

    return normalizedPath.replace(/^\/+/, '');
  }

  async findByUserId(userId: string, currentUser: User): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { userId },
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByRemitterId(remitterId: string): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { remitterId },
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByRecipientId(recipientId: string): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { recipientId },
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByStatus(statusId: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { statusId },
      relations: ['remitter', 'recipient', 'user', 'freight']
    });
    
    if (shipments.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return shipments;
  }

  async findByLocation(locationId: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { locationId },
      relations: ['remitter', 'recipient', 'user', 'freight']
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

  async getPdfBufferFromStorage(key: string): Promise<Buffer> {
    return this.storageService.getObjectBuffer(key);
  }

  async getFinancialMetrics(year: number, month: number): Promise<ShipmentFinancialMetricsDto> {
    const { startUtc, nextMonthStartUtc } = this.getMonthlyRangeInBogota(year, month);

    const shipments = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select(['shipment.statusId', 'shipment.shipmentValue'])
      .where('shipment.sendDate >= :startUtc', { startUtc })
      .andWhere('shipment.sendDate < :nextMonthStartUtc', { nextMonthStartUtc })
      .andWhere('shipment.statusId IN (:...countedStatuses)', { countedStatuses: this.countedStatuses })
      .getMany();

    const metricsByStatus = new Map<number, ShipmentMetricsByStatusDto>();
    let totalAmount = 0;

    for (const shipment of shipments) {
      const shipmentAmount = this.parseShipmentValue(shipment.shipmentValue);
      totalAmount += shipmentAmount;

      const currentStatusMetrics = metricsByStatus.get(shipment.statusId) ?? {
        statusId: shipment.statusId,
        totalShipments: 0,
        totalAmount: 0,
      };

      currentStatusMetrics.totalShipments += 1;
      currentStatusMetrics.totalAmount += shipmentAmount;
      metricsByStatus.set(shipment.statusId, currentStatusMetrics);
    }

    const totalShipments = shipments.length;
    const averageTicket = totalShipments > 0 ? totalAmount / totalShipments : 0;

    return {
      period: {
        year,
        month,
        label: `${this.monthLabels[month - 1]} ${year}`,
      },
      currency: this.currency,
      totalShipments,
      totalAmount,
      averageTicket,
      countedStatuses: this.countedStatuses,
      byStatus: Array.from(metricsByStatus.values()).sort((a, b) => a.statusId - b.statusId),
    };
  }

  private getMonthlyRangeInBogota(
    year: number,
    month: number,
  ): { startUtc: Date; nextMonthStartUtc: Date } {
    // Bogota is UTC-05:00 and has no DST, so month boundaries are stable in UTC.
    const startUtc = new Date(Date.UTC(year, month - 1, 1, 5, 0, 0, 0));
    const nextMonthStartUtc = new Date(Date.UTC(year, month, 1, 5, 0, 0, 0));
    return { startUtc, nextMonthStartUtc };
  }

  private parseShipmentValue(rawValue: string): number {
    if (!rawValue) {
      return 0;
    }

    const sanitized = rawValue
      .replace(/\s+/g, '')
      .replace(/\.(?=\d{3}(\D|$))/g, '')
      .replace(',', '.');

    const numericMatch = sanitized.match(/-?\d+(\.\d+)?/);
    if (!numericMatch) {
      return 0;
    }

    const parsed = Number(numericMatch[0]);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
