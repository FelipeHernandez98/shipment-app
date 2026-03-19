import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../commons/enums/roles.enum';
import { Auth } from '../user/decorators/auth.decorator';
import { AddShipmentsToFreightDto } from './dto/add-shipments-to-freight.dto';
import { CreateFreightDto } from './dto/create-freight.dto';
import { FreightConsolidatedPdfResponseDto } from './dto/freight-consolidated-pdf-response.dto';
import { UpdateFreightLocationDto } from './dto/update-freight-location.dto';
import { Freight } from './entities/freight.entity';
import { FreightService } from './freight.service';

@ApiTags('freights')
@Controller('freight')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @Post()
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo flete' })
  @ApiResponse({ status: 201, description: 'Flete creado exitosamente', type: Freight })
  @ApiBody({ type: CreateFreightDto })
  create(@Body() createFreightDto: CreateFreightDto): Promise<Freight> {
    return this.freightService.create(createFreightDto);
  }

  @Get()
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los fletes' })
  @ApiResponse({ status: 200, description: 'Lista de fletes', type: [Freight] })
  findAll(): Promise<Freight[]> {
    return this.freightService.findAll();
  }

  @Get('guide/:guideCode')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de un flete por codigo de guia' })
  @ApiParam({ name: 'guideCode', description: 'Codigo de guia del flete (guideCode)' })
  @ApiResponse({ status: 200, description: 'Flete encontrado', type: Freight })
  @ApiResponse({ status: 404, description: 'Flete no encontrado' })
  findByGuideCode(@Param('guideCode') guideCode: string): Promise<Freight> {
    return this.freightService.findByGuideCode(guideCode);
  }

  @Get(':id')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de un flete por ID' })
  @ApiParam({ name: 'id', description: 'ID del flete' })
  @ApiResponse({ status: 200, description: 'Flete encontrado', type: Freight })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Freight> {
    return this.freightService.findOne(id);
  }

  @Post(':id/shipments')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asociar multiples envios a un flete' })
  @ApiParam({ name: 'id', description: 'ID del flete' })
  @ApiBody({ type: AddShipmentsToFreightDto })
  @ApiResponse({ status: 200, description: 'Envios asociados al flete', type: Freight })
  addShipments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addShipmentsDto: AddShipmentsToFreightDto,
  ): Promise<Freight> {
    return this.freightService.addShipments(id, addShipmentsDto);
  }

  @Patch(':id/location')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar locationId para todos los envios del flete' })
  @ApiParam({ name: 'id', description: 'ID del flete' })
  @ApiBody({ type: UpdateFreightLocationDto })
  @ApiResponse({ status: 200, description: 'Ubicacion actualizada en envios del flete' })
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateFreightLocationDto,
  ): Promise<{ freightId: string; locationId: number; updatedShipments: number }> {
    return this.freightService.updateLocation(id, updateLocationDto);
  }

  @Post(':id/consolidated-pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar PDF consolidado del flete (1 portada + N guias)' })
  @ApiParam({ name: 'id', description: 'ID del flete' })
  @ApiResponse({
    status: 200,
    description: 'PDF consolidado generado',
    type: FreightConsolidatedPdfResponseDto,
  })
  generateConsolidatedPdf(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FreightConsolidatedPdfResponseDto> {
    return this.freightService.generateConsolidatedPdf(id);
  }

  @Get(':id/consolidated-pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar PDF consolidado del flete' })
  @ApiProduces('application/pdf')
  @ApiParam({ name: 'id', description: 'ID del flete' })
  @ApiResponse({ status: 200, description: 'PDF descargado' })
  async downloadConsolidatedPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const pdfPath = await this.freightService.getConsolidatedPdfPath(id);
    const pdfBuffer = await this.freightService.getPdfBufferFromStorage(pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="freight-${id}-consolidated.pdf"`);

    return res.send(pdfBuffer);
  }
}
