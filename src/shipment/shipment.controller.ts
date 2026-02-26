import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { Roles } from 'src/commons/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Shipment } from './entities/shipment.entity';

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

  @Get(':id/pdf')
  @Auth(Roles.administrator, Roles.user)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar PDF del envío' })
  @ApiParam({ name: 'id', description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'PDF descargado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfPath = await this.shipmentService.getPdfPath(id);
    res.download(pdfPath, `shipment-${id}.pdf`);
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
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
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
  remove(@Param('id') id: string) {
    return this.shipmentService.remove(id);
  }
}
