import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { Client } from '../../client/entities/client.entity';
import { User } from "src/user/entities/user.entity";
import { ApiProperty } from '@nestjs/swagger';

@Entity('shipment', { schema: 'shipmentschema' })   
export class Shipment {

    @ApiProperty({
        description: 'ID único del envío',
        example: '550e8400-e29b-41d4-a716-446655440002'
    })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Código de rastreo único',
        example: 'TRK123456789'
    })
    @Column('character varying', { name: 'tracking_code', length: 20, unique: true })
    trackingCode: string;

    @ApiProperty({
        description: 'ID del remitente',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @Column('uuid', { name: 'remitter_id' })
    remitterId: string;

    @ApiProperty({
        description: 'ID del destinatario',
        example: '550e8400-e29b-41d4-a716-446655440003'
    })
    @Column('uuid', { name: 'recipient_id' })
    recipientId: string;

    @ApiProperty({
        description: 'ID del usuario que creó el envío',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @Column('uuid', { name: 'user_id' })
    userId: string;

    @ApiProperty({
        description: 'Información del remitente',
        type: () => Client
    })
    @ManyToOne(() => Client, (client) => client.shippmentsSent)
    @JoinColumn({ name: 'remitter_id' })
    remitter: Client;

    @ApiProperty({
        description: 'Información del destinatario',
        type: () => Client
    })
    @ManyToOne(() => Client, (client) => client.shipmentsReceived)
    @JoinColumn({ name: 'recipient_id' })
    recipient: Client;

    @ApiProperty({
        description: 'Información del usuario',
        type: () => User
    })
    @ManyToOne(() => User, (user) => user.shipments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty({
        description: 'Descripción del paquete',
        example: 'Paquete con documentos importantes'
    })
    @Column('character varying', { name: 'package_description', length: 100 })
    packageDescription: string;

    @ApiProperty({
        description: 'Valor declarado del envío',
        example: '$150000 COP'
    })
    @Column('character varying', { name: 'shipment_value', length: 50 , nullable: true})
    shipmentValue: string;

    @ApiProperty({
        description: 'Fecha de envío',
        example: '2023-10-01T12:00:00Z'
    })
    @Column('timestamp with time zone', { name: 'send_date' })
    sendDate: Date;

    @ApiProperty({
        description: 'Fecha de entrega',
        example: '2023-10-05T12:00:00Z',
        required: false
    })
    @Column('timestamp with time zone', { name: 'delivery_date', nullable: true })
    deliveryDate: Date;

    @ApiProperty({
        description: 'Fecha de actualización',
        example: '2023-10-02T12:00:00Z',
        required: false
    })
    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date;

    @ApiProperty({
        description: 'ID de la ubicación',
        example: 1
    })
    @Column('int2', { name: 'location_id' })
    locationId: number;

    @ApiProperty({
        description: 'ID del estado',
        example: 2
    })
    @Column('int2', { name: 'status_id' })
    statusId: number;

    @ApiProperty({
        description: 'Referencia del PDF (object key en R2 o URL absoluta)',
        example: 'shipments/2026/03/shipment-uuid.pdf',
        required: false
    })
    @Column('character varying', { name: 'pdf_path', nullable: true })
    pdfPath: string;

    @BeforeInsert()
    generateId() {
        this.id = uuidv7();
    }
}
