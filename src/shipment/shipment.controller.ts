import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, ParseIntPipe, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { Roles } from 'src/commons/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiProduces, ApiQuery } from '@nestjs/swagger';
import { Shipment } from './entities/shipment.entity';
import { ShipmentFinancialMetricsDto } from './dto/shipment-financial-metrics.dto';

@ApiTags('shipments')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo envío' })
  @ApiResponse({ status: 201, description: 'Envío creado exitosamente', type: Shipment })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreateShipmentDto })
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.create(createShipmentDto);
  }

  @Get()
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los envíos' })
  @ApiResponse({ status: 200, description: 'Lista de envíos', type: [Shipment] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get('tracking/:trackingCode')
  @ApiOperation({ summary: 'Buscar envío por código de rastreo' })
  @ApiParam({ name: 'trackingCode', description: 'Código de rastreo del envío' })
  @ApiResponse({ status: 200, description: 'Envío encontrado', type: Shipment })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.shipmentService.findByTrackingCode(trackingCode);
  }

  @Get('metrics')
  @Auth(Roles.administrator)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener métricas financieras de envíos por mes (solo administradores)' })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2026 })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Métricas financieras calculadas', type: ShipmentFinancialMetricsDto })
  @ApiResponse({ status: 400, description: 'Parámetros year/month inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  getFinancialMetrics(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    this.validateYearAndMonth(year, month);
    return this.shipmentService.getFinancialMetrics(year, month);
  }

  @Get('user/:userId')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener envíos por ID de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de envíos del usuario', type: [Shipment] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUserId(@Param('userId') userId: string, @GetUser() user: User) {
    return this.shipmentService.findByUserId(userId, user);
  }

  @Get('remitter/:remitterId')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener envíos por ID de remitente' })
  @ApiParam({ name: 'remitterId', description: 'ID del remitente' })
  @ApiResponse({ status: 200, description: 'Lista de envíos del remitente', type: [Shipment] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Remitente no encontrado' })
  findByRemitterId(@Param('remitterId') remitterId: string) {
    return this.shipmentService.findByRemitterId(remitterId);
  }

  @Get('recipient/:recipientId')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener envíos por ID de destinatario' })
  @ApiParam({ name: 'recipientId', description: 'ID del destinatario' })
  @ApiResponse({ status: 200, description: 'Lista de envíos del destinatario', type: [Shipment] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Destinatario no encontrado' })
  findByRecipientId(@Param('recipientId') recipientId: string) {
    return this.shipmentService.findByRecipientId(recipientId);
  }

  @Get('status/:statusId')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener envíos por ID de estado' })
  @ApiParam({ name: 'statusId', description: 'ID del estado' })
  @ApiResponse({ status: 200, description: 'Lista de envíos con ese estado', type: [Shipment] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Estado no encontrado' })
  findByStatus(@Param('statusId') statusId: string) {
    return this.shipmentService.findByStatus(+statusId);
  }

  @Get(':id')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener envío por ID' })
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'Envío encontrado', type: Shipment })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentService.findOne(id);
  }

  @Post(':id/pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar PDF del envío bajo demanda (si no existe)' })
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de generación/reutilización del PDF del envío',
    schema: {
      example: {
        shipmentId: '550e8400-e29b-41d4-a716-446655440099',
        pdfPath: 'shipments/2026/03/550e8400-e29b-41d4-a716-446655440099.pdf',
        generated: true,
      },
    },
  })
  generatePdfOnDemand(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentService.generatePdfOnDemand(id);
  }

  @Get(':id/pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar PDF del envío (R2 o legado local)' })
  @ApiProduces('application/pdf')
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'PDF descargado' })
  @ApiResponse({ status: 302, description: 'Redirección a URL externa del PDF' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  async downloadPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdfPath = await this.shipmentService.getPdfPath(id);

    // Backward compatibility: legacy records may still point to a local file.
    const legacyLocalPath = this.resolveLegacyLocalPdfPath(pdfPath);
    if (legacyLocalPath) {
      return res.download(legacyLocalPath, `shipment-${id}.pdf`);
    }

    if (/^https?:\/\//i.test(pdfPath)) {
      return res.redirect(pdfPath);
    }

    const pdfBuffer = await this.shipmentService.getPdfBufferFromStorage(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shipment-${id}.pdf"`);
    return res.send(pdfBuffer);
  }

  @Patch(':id')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un envío' })
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'Envío actualizado', type: Shipment })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  @ApiBody({ type: UpdateShipmentDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  @Auth(Roles.administrator)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un envío (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'Envío eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentService.remove(id);
  }

  @Post('daily-consolidated-pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar PDF consolidado diario (relación de despachos)' })
  @ApiQuery({ name: 'date', required: true, type: String, example: '2026-03-24', description: 'Fecha en formato YYYY-MM-DD' })
  @ApiResponse({
    status: 200,
    description: 'PDF consolidado generado exitosamente',
    schema: {
      example: {
        date: '2026-03-24',
        totalShipments: 15,
        pdfPath: 'uploads/pdfs/2026-03-24.pdf',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No hay envios para la fecha especificada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async generateDailyConsolidatedPdf(
    @Query('date') date: string,
    @GetUser() user: User,
  ) {
    return this.shipmentService.generateDailyConsolidatedPdf(date, user);
  }

  @Get('daily-consolidated-pdf/:date')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar PDF consolidado diario y eliminarlo' })
  @ApiProduces('application/pdf')
  @ApiParam({ name: 'date', description: 'Fecha en formato YYYY-MM-DD', example: '2026-03-24' })
  @ApiResponse({ status: 200, description: 'PDF descargado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async downloadDailyConsolidatedPdf(@Param('date') date: string, @Res() res: Response) {
    const pdfPath = `uploads/pdfs/${date}.pdf`;
    const fullPath = path.join(process.cwd(), pdfPath);

    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException(`Daily consolidated PDF not found for date ${date}. Please generate it first.`);
    }

    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="consolidado-${date}.pdf"`);

      const fileStream = fs.createReadStream(fullPath);

      fileStream.on('end', () => {
        // Eliminar el archivo después de que se envíe completamente
        try {
          fs.unlinkSync(fullPath);
        } catch (deleteErr) {
          console.error(`Error deleting file ${fullPath}:`, deleteErr);
        }
      });

      fileStream.on('error', (err) => {
        console.error(`Stream error for ${fullPath}:`, err);
        res.status(500).send('Error downloading file');
      });

      fileStream.pipe(res);
    } catch (error) {
      throw new BadRequestException(`Error downloading daily consolidated PDF: ${error.message}`);
    }
  }

  private resolveLegacyLocalPdfPath(pdfPath: string): string | null {
    const normalizedPath = pdfPath.trim();
    if (!normalizedPath) {
      return null;
    }

    const possiblePaths = [
      normalizedPath,
      path.join(process.cwd(), normalizedPath.replace(/^\/+/, '')),
    ];

    for (const candidatePath of possiblePaths) {
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        return candidatePath;
      }
    }

    return null;
  }

  private validateYearAndMonth(year: number, month: number): void {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Query param "year" must be between 2000 and 2100');
    }

    if (month < 1 || month > 12) {
      throw new BadRequestException('Query param "month" must be between 1 and 12');
    }
  }
}
