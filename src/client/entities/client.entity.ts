import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from "uuid";
import { Shipment } from '../../shipment/entities/shipment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('client', { schema: 'shipmentschema' })
export class Client {

    @ApiProperty({
        description: 'ID único del cliente',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'María'
    })
    @Column('character varying', { name: 'name', length: 30 })
    name: string;

    @ApiProperty({
        description: 'Apellido del cliente',
        example: 'García'
    })
    @Column('character varying', { name: 'lastname', length: 30 })
    lastname: string;

    @ApiProperty({
        description: 'Tipo de documento',
        example: 'CC'
    })
    @Column('character varying', { name: 'document_type', length: 5 })
    documentType: string;

    @ApiProperty({
        description: 'Número de documento único',
        example: '1234567890'
    })
    @Column('character varying', { name: 'document_number', length: 20, unique: true })
    documentNumber: string;

    @ApiProperty({
        description: 'Número de teléfono',
        example: '0987654321'
    })
    @Column('character varying', { name: 'phone_number', length: 15 })
    phoneNumber: string;

    @ApiProperty({
        description: 'Dirección',
        example: 'Calle 123 #45-67'
    })
    @Column('character varying', { name: 'address', length: 100 })
    address: string;

    @ApiProperty({
        description: 'Ciudad',
        example: 'Bogotá'
    })
    @Column('character varying', { name: 'city', length: 30 })
    city: string;

    @ApiProperty({
        description: 'Correo electrónico único',
        example: 'maria.garcia@example.com'
    })
    @Column('character varying', { name: 'email', unique: true, length: 40 })
    email: string;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2023-10-01T12:00:00Z'
    })
    @Column('timestamp with time zone', { name: 'create_at' })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de actualización',
        example: '2023-10-02T12:00:00Z',
        required: false
    })
    @Column('timestamp with time zone', { name: 'update_at', nullable: true })
    updatedAt: Date;

    @OneToMany(() => Shipment, (shipment) => shipment.remitter)
    shippmentsSent: Shipment[];

    @OneToMany(() => Shipment, (shipment) => shipment.recipient)
    shipmentsReceived: Shipment[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
        this.id = uuidv7();
    }
}
