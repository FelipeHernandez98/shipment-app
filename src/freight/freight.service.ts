import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Freight } from './entities/freight.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { CreateFreightDto } from './dto/create-freight.dto';
import { AddShipmentsToFreightDto } from './dto/add-shipments-to-freight.dto';
import { UpdateFreightLocationDto } from './dto/update-freight-location.dto';
import { CustomExceptions } from '../commons/exceptions/custom-exceptions';
import { UserService } from '../user/user.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { LocationsEnum } from '../commons/enums/locations.enum';
import { FreightConsolidatedPdfResponseDto } from './dto/freight-consolidated-pdf-response.dto';
import { FreightTrackingSequenceService } from './freight-tracking-sequence.service';

@Injectable()
export class FreightService {
  constructor(
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    private readonly userService: UserService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly freightTrackingSequenceService: FreightTrackingSequenceService,
  ) {}

  async create(createFreightDto: CreateFreightDto): Promise<Freight> {
    await this.userService.findOne(createFreightDto.createdByUserId);
    const guideCode = await this.freightTrackingSequenceService.generateGuideCode();

    const freight = this.freightRepository.create({
      ...createFreightDto,
      originCity: createFreightDto.originCity.toUpperCase().trim(),
      destinationCity: createFreightDto.destinationCity.toUpperCase().trim(),
      guideCode,
      createdAt: new Date(),
      totalPackages: 0,
    });

    return this.freightRepository.save(freight);
  }

  async findAll(): Promise<Freight[]> {
    const freights = await this.freightRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (freights.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }

    return freights;
  }

  async findOne(id: string): Promise<Freight> {
    const freight = await this.freightRepository.findOne({
      where: { id },
      relations: ['shipments'],
    });

    if (!freight) {
      throw CustomExceptions.FreightNotFoundException(id);
    }

    return freight;
  }

  async addShipments(
    id: string,
    addShipmentsDto: AddShipmentsToFreightDto,
  ): Promise<Freight> {
    const freight = await this.freightRepository.findOne({ where: { id } });
    if (!freight) {
      throw CustomExceptions.FreightNotFoundException(id);
    }

    const uniqueShipmentIds = Array.from(new Set(addShipmentsDto.shipmentIds));
    const shipments = await this.shipmentRepository.find({
      where: { id: In(uniqueShipmentIds) },
    });

    if (shipments.length !== uniqueShipmentIds.length) {
      const foundIds = new Set(shipments.map((shipment) => shipment.id));
      const missingId = uniqueShipmentIds.find((shipmentId) => !foundIds.has(shipmentId));
      throw CustomExceptions.ShipmentNotFoundException(missingId);
    }

    const alreadyInOtherFreight = shipments.find(
      (shipment) => shipment.freightId && shipment.freightId !== id,
    );

    if (alreadyInOtherFreight) {
      throw new BadRequestException(
        `Shipment ${alreadyInOtherFreight.id} is already assigned to freight ${alreadyInOtherFreight.freightId}`,
      );
    }

    await this.shipmentRepository.update(
      { id: In(uniqueShipmentIds) },
      { freightId: id, updatedAt: new Date() },
    );

    await this.refreshTotalPackages(id);
    await this.invalidateConsolidatedPdf(freight);

    return this.findOne(id);
  }

  async updateLocation(id: string, updateLocationDto: UpdateFreightLocationDto): Promise<{
    freightId: string;
    locationId: number;
    updatedShipments: number;
  }> {
    await this.ensureFreightExists(id);
    this.validateLocation(updateLocationDto.locationId);

    const result = await this.shipmentRepository.update(
      { freightId: id },
      {
        locationId: updateLocationDto.locationId,
        updatedAt: new Date(),
      },
    );

    return {
      freightId: id,
      locationId: updateLocationDto.locationId,
      updatedShipments: result.affected ?? 0,
    };
  }

  async generateConsolidatedPdf(id: string): Promise<FreightConsolidatedPdfResponseDto> {
    const freight = await this.freightRepository.findOne({ where: { id } });
    if (!freight) {
      throw CustomExceptions.FreightNotFoundException(id);
    }

    const shipments = await this.shipmentRepository.find({
      where: { freightId: id },
      relations: ['remitter', 'recipient', 'user'],
      order: { sendDate: 'ASC' },
    });

    if (shipments.length === 0) {
      throw new BadRequestException('Cannot generate consolidated PDF for an empty freight');
    }

    const pdfPath = await this.pdfService.generateFreightConsolidatedGuide(freight, shipments);
    freight.consolidatedPdfPath = pdfPath;
    freight.totalPackages = shipments.length;
    freight.updatedAt = new Date();
    await this.freightRepository.save(freight);

    return {
      freightId: id,
      pdfPath,
      totalPages: shipments.length + 1,
    };
  }

  async getConsolidatedPdfPath(id: string): Promise<string> {
    const freight = await this.freightRepository.findOne({ where: { id } });

    if (!freight) {
      throw CustomExceptions.FreightNotFoundException(id);
    }

    if (!freight.consolidatedPdfPath) {
      throw new BadRequestException('Freight consolidated PDF has not been generated yet');
    }

    return freight.consolidatedPdfPath;
  }

  async getPdfBufferFromStorage(key: string): Promise<Buffer> {
    return this.storageService.getObjectBuffer(key);
  }

  private async ensureFreightExists(id: string): Promise<void> {
    const freight = await this.freightRepository.findOne({ where: { id } });
    if (!freight) {
      throw CustomExceptions.FreightNotFoundException(id);
    }
  }

  private async refreshTotalPackages(freightId: string): Promise<void> {
    const totalPackages = await this.shipmentRepository.count({ where: { freightId } });
    await this.freightRepository.update(freightId, {
      totalPackages,
      updatedAt: new Date(),
    });
  }

  private async invalidateConsolidatedPdf(freight: Freight): Promise<void> {
    if (!freight.consolidatedPdfPath) {
      return;
    }

    try {
      await this.storageService.deleteObject(freight.consolidatedPdfPath);
    } catch {
      // If object deletion fails we still clear the reference to force regeneration.
    }

    await this.freightRepository.update(freight.id, {
      consolidatedPdfPath: null,
      updatedAt: new Date(),
    });
  }

  private validateLocation(locationId: number): void {
    const validLocations = Object.values(LocationsEnum).filter(
      (value): value is number => typeof value === 'number',
    );

    if (!validLocations.includes(locationId)) {
      throw new BadRequestException('Invalid locationId for shipment location enum');
    }
  }

}
