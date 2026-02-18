import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { Roles } from 'src/commons/enums/roles.enum';
import { User } from 'src/user/entities/user.entity';

@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @Auth(Roles.administrator, Roles.user)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.create(createShipmentDto);
  }

  @Get()
  @Auth(Roles.administrator, Roles.user)
  findAll() {
    return this.shipmentService.findAll();
  }

  @Get('tracking/:trackingCode')
  findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.shipmentService.findByTrackingCode(trackingCode);
  }

  @Get('user/:userId')
  @Auth(Roles.administrator, Roles.user)
  findByUserId(@Param('userId') userId: string, @GetUser() user: User) {
    return this.shipmentService.findByUserId(userId, user);
  }

  @Get('remitter/:remitterId')
  @Auth(Roles.administrator, Roles.user)
  findByRemitterId(@Param('remitterId') remitterId: string) {
    return this.shipmentService.findByRemitterId(remitterId);
  }

  @Get('recipient/:recipientId')
  @Auth(Roles.administrator, Roles.user)
  findByRecipientId(@Param('recipientId') recipientId: string) {
    return this.shipmentService.findByRecipientId(recipientId);
  }

  @Get('status/:statusId')
  @Auth(Roles.administrator, Roles.user)
  findByStatus(@Param('statusId') statusId: string) {
    return this.shipmentService.findByStatus(+statusId);
  }

  @Get('location/:locationId')
  @Auth(Roles.administrator, Roles.user)
  findByLocation(@Param('locationId') locationId: string) {
    return this.shipmentService.findByLocation(+locationId);
  }

  @Patch(':id')
  @Auth(Roles.administrator, Roles.user)
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  @Auth(Roles.administrator)
  remove(@Param('id') id: string) {
    return this.shipmentService.remove(id);
  }
}
