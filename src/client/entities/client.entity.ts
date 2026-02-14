import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from "uuid";

@Entity('client', { schema: 'shipmentschema' })
export class Client {

    @PrimaryColumn('uuid')
    id: string;

    @Column('character varying', { name: 'name', length: 30 })
    name: string;

    @Column('character varying', { name: 'lastname', length: 30 })
    lastname: string;

    @Column('character varying', { name: 'document_type', length: 5 })
    documentType: string;

    @Column('character varying', { name: 'document_number', length: 20, unique: true })
    documentNumber: string;

    @Column('character varying', { name: 'phone_number', length: 15 })
    phoneNumber: string;

    @Column('character varying', { name: 'address', length: 100 })
    address: string;

    @Column('character varying', { name: 'city', length: 30 })
    city: string;

    @Column('character varying', { name: 'email', unique: true, length: 40 })
    email: string;

    @Column('timestamp with time zone', { name: 'create_at' })
    createdAt: Date;

    @Column('timestamp with time zone', { name: 'update_at' })
    updatedAt: Date;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
        this.id = uuidv7();
    }
}
