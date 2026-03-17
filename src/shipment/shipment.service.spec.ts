import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentService } from './shipment.service';
import { Shipment } from './entities/shipment.entity';
import { Freight } from '../freight/entities/freight.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { TrackingSequenceService } from './tracking-sequence.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';

describe('ShipmentService', () => {
  let service: ShipmentService;
  const shipmentRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const freightRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: shipmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Freight),
          useValue: freightRepositoryMock,
        },
        {
          provide: UserService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ClientService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: TrackingSequenceService,
          useValue: { generateTrackingCode: jest.fn() },
        },
        {
          provide: PdfService,
          useValue: { generateShipmentGuide: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { getObjectBuffer: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ShipmentService>(ShipmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw when freightId does not exist', async () => {
    freightRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        remitterId: '550e8400-e29b-41d4-a716-446655440002',
        recipientId: '550e8400-e29b-41d4-a716-446655440003',
        freightId: '550e8400-e29b-41d4-a716-446655440099',
        packageDescription: 'Docs',
        shipmentValue: '$1000 COP',
      }),
    ).rejects.toThrow('Freight with id 550e8400-e29b-41d4-a716-446655440099 not found');
  });
});
