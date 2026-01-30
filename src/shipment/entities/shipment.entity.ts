import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { v7 as uuidv7 } from "uuid";

@Entity('shipment', { schema: 'shipmentschema' })   
export class Shipment {

    @PrimaryColumn('uuid')
    id: string;

    @Column('character varying', { name: 'tracking_code', length: 20, unique: true })
    trackingCode: string;

    @Column('character varying', { name: 'remitter_id', length: 20 })
    remitterId: string;

    @Column('character varying', { name: 'recipient_id', length: 20 })
    recipientId: string;

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
