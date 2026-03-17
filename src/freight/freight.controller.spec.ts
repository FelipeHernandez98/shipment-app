import { Test, TestingModule } from '@nestjs/testing';
import { FreightController } from './freight.controller';
import { FreightService } from './freight.service';

describe('FreightController', () => {
  let controller: FreightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightController],
      providers: [
        {
          provide: FreightService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            addShipments: jest.fn(),
            updateLocation: jest.fn(),
            generateConsolidatedPdf: jest.fn(),
            getConsolidatedPdfPath: jest.fn(),
            getPdfBufferFromStorage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FreightController>(FreightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
