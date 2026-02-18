import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { Client } from '../../client/entities/client.entity';
import { User } from "src/user/entities/user.entity";

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

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @ManyToOne(() => Client, (client) => client.shippmentsSent)
    @JoinColumn({ name: 'remitter_id' })
    remitter: Client;

    @ManyToOne(() => Client, (client) => client.shipmentsReceived)
    @JoinColumn({ name: 'recipient_id' })
    recipient: Client;

    @ManyToOne(() => User, (user) => user.shipments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('character varying', { name: 'package_description', length: 100 })
    packageDescription: string;

    @Column('timestamp with time zone', { name: 'send_date' })
    sendDate: Date;

    @Column('timestamp with time zone', { name: 'delivery_date', nullable: true })
    deliveryDate: Date;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date;

    @Column('int2', { name: 'location_id' })
    locationId: number;

    @Column('int2', { name: 'status_id' })
    statusId: number;

    @Column('character varying', { name: 'pdf_path', nullable: true })
    pdfPath: string;

    @BeforeInsert()
    generateId() {
        this.id = uuidv7();
    }
}
