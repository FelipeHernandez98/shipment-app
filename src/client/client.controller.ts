import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { Roles } from 'src/commons/enums/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Client } from './entities/client.entity';

@ApiTags('clients')
@ApiBearerAuth()
@Auth( Roles.administrator, Roles.user )
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente', type: Client })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateClientDto })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes', type: [Client] })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por número de documento' })
  @ApiParam({ name: 'id', description: 'Número de documento del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Client })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') documentNumber: string) {
    return this.clientService.findOne(documentNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado', type: Client })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiBody({ type: UpdateClientDto })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Auth( Roles.administrator )
  @ApiOperation({ summary: 'Eliminar un cliente (solo administradores)' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
