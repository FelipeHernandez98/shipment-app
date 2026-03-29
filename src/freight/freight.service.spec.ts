import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FreightService } from './freight.service';
import { Freight } from './entities/freight.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { UserService } from '../user/user.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { FreightTrackingSequenceService } from './freight-tracking-sequence.service';
import { LocationsEnum } from '../commons/enums/locations.enum';
import { StatusEnum } from '../commons/enums/status.enum';

describe('FreightService', () => {
  let service: FreightService;

  const freightRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const shipmentRepositoryMock = {
    find: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const userServiceMock = {
    findOne: jest.fn(),
  };

  const freightTrackingSequenceServiceMock = {
    generateGuideCode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreightService,
        {
          provide: getRepositoryToken(Freight),
          useValue: freightRepositoryMock,
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: shipmentRepositoryMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: PdfService,
          useValue: { generateFreightConsolidatedGuide: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { getObjectBuffer: jest.fn(), deleteObject: jest.fn() },
        },
        {
          provide: FreightTrackingSequenceService,
          useValue: freightTrackingSequenceServiceMock,
        },
      ],
    }).compile();

    service = module.get<FreightService>(FreightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return updated count when updating location', async () => {
    freightRepositoryMock.findOne.mockResolvedValue({ id: 'f-1' });
    freightRepositoryMock.update.mockResolvedValue({ affected: 1 });
    shipmentRepositoryMock.update.mockResolvedValue({ affected: 3 });

    const result = await service.updateLocation('f-1', { locationId: 2 });

    expect(result).toEqual({
      freightId: 'f-1',
      locationId: 2,
      updatedShipments: 3,
    });
    expect(shipmentRepositoryMock.update).toHaveBeenCalledWith(
      { freightId: 'f-1' },
      expect.objectContaining({ locationId: 2 }),
    );
    expect(freightRepositoryMock.update).toHaveBeenCalledWith(
      'f-1',
      expect.objectContaining({ locationId: 2 }),
    );
  });

  it('should set delivered status when updating location to completed', async () => {
    freightRepositoryMock.findOne.mockResolvedValue({ id: 'f-2' });
    freightRepositoryMock.update.mockResolvedValue({ affected: 1 });
    shipmentRepositoryMock.update.mockResolvedValue({ affected: 2 });

    await service.updateLocation('f-2', { locationId: LocationsEnum.COMPLETED });

    expect(shipmentRepositoryMock.update).toHaveBeenCalledWith(
      { freightId: 'f-2' },
      expect.objectContaining({
        locationId: LocationsEnum.COMPLETED,
        statusId: StatusEnum.DELIVERED,
      }),
    );
  });

  it('should find freight by guide code', async () => {
    freightRepositoryMock.findOne.mockResolvedValue({ id: 'f-3', guideCode: 'FT-170320260000001' });

    const result = await service.findByGuideCode('ft-170320260000001');

    expect(freightRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { guideCode: 'FT-170320260000001' },
      relations: ['shipments'],
    });
    expect(result).toEqual({ id: 'f-3', guideCode: 'FT-170320260000001' });
  });

  it('should create freight with FT guide code format', async () => {
    userServiceMock.findOne.mockResolvedValue({ id: 'user-1' });
    freightTrackingSequenceServiceMock.generateGuideCode.mockResolvedValue('FT-170320260000001');

    const createdFreight = {
      guideCode: 'FT-170320260000001',
      originCity: 'CUCUTA',
      destinationCity: 'BOGOTA',
      locationId: LocationsEnum.BODEGA_CUCUTA,
      createdByUserId: '550e8400-e29b-41d4-a716-446655440000',
      totalPackages: 0,
      createdAt: new Date(),
    };

    freightRepositoryMock.create.mockReturnValue(createdFreight);
    freightRepositoryMock.save.mockResolvedValue(createdFreight);

    const result = await service.create({
      createdByUserId: '550e8400-e29b-41d4-a716-446655440000',
      originCity: ' cucuta ',
      destinationCity: ' bogota ',
    });

    expect(freightTrackingSequenceServiceMock.generateGuideCode).toHaveBeenCalled();
    expect(freightRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        guideCode: 'FT-170320260000001',
        originCity: 'CUCUTA',
        destinationCity: 'BOGOTA',
        locationId: LocationsEnum.BODEGA_CUCUTA,
      }),
    );
    expect(result).toEqual(createdFreight);
  });
});
