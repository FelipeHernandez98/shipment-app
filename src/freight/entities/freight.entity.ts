import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('freight', { schema: 'shipmentschema' })
export class Freight {
  @ApiProperty({
    description: 'ID unico del flete',
    example: '550e8400-e29b-41d4-a716-446655440099',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Codigo de guia del flete (FT- + DDMMYYYY + consecutivo de 7 digitos)',
    example: 'FT-170320260000001',
  })
  @Column('character varying', { name: 'guide_code', length: 120, unique: true })
  guideCode: string;

  @ApiProperty({
    description: 'Ciudad de origen del flete',
    example: 'CUCUTA',
  })
  @Column('character varying', { name: 'origin_city', length: 80 })
  originCity: string;

  @ApiProperty({
    description: 'Ciudad de destino del flete',
    example: 'BOGOTA',
  })
  @Column('character varying', { name: 'destination_city', length: 80 })
  destinationCity: string;

  @ApiProperty({
    description: 'Cantidad total de paquetes (envios) en el flete',
    example: 100,
  })
  @Column('int4', { name: 'total_packages', default: 0 })
  totalPackages: number;

  @ApiProperty({
    description: 'ID del usuario que creo el flete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column('uuid', { name: 'created_by_user_id' })
  createdByUserId: string;

  @ApiProperty({
    description: 'Ruta del PDF consolidado del flete en storage',
    required: false,
    example: 'shipments/freights/2026/03/uuid/consolidated-1710632000.pdf',
  })
  @Column('character varying', { name: 'consolidated_pdf_path', nullable: true })
  consolidatedPdfPath: string;

  @ApiProperty({
    description: 'Fecha de creacion del flete',
    example: '2026-03-16T14:20:00.000Z',
  })
  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion del flete',
    required: false,
  })
  @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Envios asociados al flete',
    type: () => [Shipment],
  })
  @OneToMany(() => Shipment, (shipment) => shipment.freight)
  shipments: Shipment[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
