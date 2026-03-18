import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';

describe('ShipmentController', () => {
  let controller: ShipmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentController],
      providers: [
        {
          provide: ShipmentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByTrackingCode: jest.fn(),
            findByUserId: jest.fn(),
            findByRemitterId: jest.fn(),
            findByRecipientId: jest.fn(),
            findByStatus: jest.fn(),
            findOne: jest.fn(),
            generatePdfOnDemand: jest.fn(),
            getPdfPath: jest.fn(),
            getPdfBufferFromStorage: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getFinancialMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShipmentController>(ShipmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
