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

  const storageServiceMock = {
    getObjectBuffer: jest.fn(),
    deleteObject: jest.fn(),
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
          useValue: storageServiceMock,
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

  it('should delete pdf from storage before removing shipment when pdfPath exists', async () => {
    shipmentRepositoryMock.findOne.mockResolvedValue({
      id: 'shipment-1',
      pdfPath: 'shipments/2026/03/shipment-1.pdf',
    });
    shipmentRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    await service.remove('shipment-1');

    expect(storageServiceMock.deleteObject).toHaveBeenCalledWith('shipments/2026/03/shipment-1.pdf');
    expect(shipmentRepositoryMock.delete).toHaveBeenCalledWith('shipment-1');
  });

  it('should delete pdf from storage when pdfPath is a full URL', async () => {
    shipmentRepositoryMock.findOne.mockResolvedValue({
      id: 'shipment-2',
      pdfPath: 'https://cdn.example.com/shipments/2026/03/shipment-2.pdf',
    });
    shipmentRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    await service.remove('shipment-2');

    expect(storageServiceMock.deleteObject).toHaveBeenCalledWith('shipments/2026/03/shipment-2.pdf');
    expect(shipmentRepositoryMock.delete).toHaveBeenCalledWith('shipment-2');
  });

  it('should remove shipment without deleting object when pdfPath is empty', async () => {
    shipmentRepositoryMock.findOne.mockResolvedValue({
      id: 'shipment-3',
      pdfPath: '   ',
    });
    shipmentRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    await service.remove('shipment-3');

    expect(storageServiceMock.deleteObject).not.toHaveBeenCalled();
    expect(shipmentRepositoryMock.delete).toHaveBeenCalledWith('shipment-3');
  });
});
