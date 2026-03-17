import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FreightService } from './freight.service';
import { Freight } from './entities/freight.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { UserService } from '../user/user.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';

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
          useValue: { findOne: jest.fn() },
        },
        {
          provide: PdfService,
          useValue: { generateFreightConsolidatedGuide: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { getObjectBuffer: jest.fn(), deleteObject: jest.fn() },
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
    shipmentRepositoryMock.update.mockResolvedValue({ affected: 3 });

    const result = await service.updateLocation('f-1', { locationId: 2 });

    expect(result).toEqual({
      freightId: 'f-1',
      locationId: 2,
      updatedShipments: 3,
    });
  });
});
