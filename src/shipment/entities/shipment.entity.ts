import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { Client } from '../../client/entities/client.entity';

@Entity('shipment', { schema: 'shipmentschema' })   
export class Shipment {

    @PrimaryColumn('uuid')
    id: string;

    @Column('character varying', { name: 'tracking_code', length: 20, unique: true })
    trackingCode: string;

    @Column('uuid', { name: 'remitter_id' })
    remitterId: string;

    @Column('uuid', { name: 'recipient_id' })
    recipientId: string;

    @ManyToOne(() => Client, (client) => client.shippmentsSent)
    @JoinColumn({ name: 'remitter_id' })
    remitter: Client;

    @ManyToOne(() => Client, (client) => client.shipmentsReceived)
    @JoinColumn({ name: 'recipient_id' })
    recipient: Client;

    @Column('character varying', { name: 'package_description', length: 100 })
    packageDescription: string;

    @Column('timestamp with time zone', { name: 'send_date' })
    sendDate: Date;

    @Column('timestamp with time zone', { name: 'delivery_date' })
    deliveryDate: Date;

    @Column('timestamp with time zone', { name: 'create_at' })
    updatedAt: Date;

    @Column('int2', { name: 'location_id' })
    locationId: number;

    @Column('int2', { name: 'status_id' })
    statusId: number;

    @BeforeInsert()
    generateId() {
        this.id = uuidv7();
    }
}
