import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { Roles } from 'src/commons/enums/roles.enum';

@Auth()
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') documentNumber: string) {
    return this.clientService.findOne(documentNumber);
  }

  @Patch(':id')
  update(@Param('id') documentNumber: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(documentNumber, updateClientDto);
  }

  @Delete(':id')
  @Auth( Roles.administrator )
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
