import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from "uuid";

@Entity('user', { schema: 'shipmentschema' })
export class User {

    @PrimaryColumn('uuid')
    id: string;

    @Column('character varying', { name: 'name', length: 30 })
    name: string;

    @Column('character varying', { name: 'lastname', length: 30 })
    lastname: string;

    @Column('character varying', { name: 'username', length: 15 })
    username: string;

    @Column('character varying', { name: 'phone_number', length: 15 })
    phoneNumber: string;

    @Column('character varying', { name: 'password', length: 100 })
    password: string;

    @Column('timestamp with time zone', { name: 'create_at' })
    createdAt: Date;

    @Column('timestamp with time zone', { name: 'update_at', nullable: true })
    updatedAt: Date;

    @Column('int2', { name: 'state_id' })
    stateId: number;

    @Column('int2', { name: 'role_id' })
    roleId: number;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.id = uuidv7();
    }
}
