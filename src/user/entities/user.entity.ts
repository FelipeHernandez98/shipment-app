import { Shipment } from 'src/shipment/entities/shipment.entity';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from "uuid";
import { ApiProperty } from '@nestjs/swagger';

@Entity('user', { schema: 'shipmentschema' })
export class User {

    @ApiProperty({
        description: 'ID único del usuario',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan'
    })
    @Column('character varying', { name: 'name', length: 30 })
    name: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez'
    })
    @Column('character varying', { name: 'lastname', length: 30 })
    lastname: string;

    @ApiProperty({
        description: 'Nombre de usuario único',
        example: 'juanperez'
    })
    @Column('character varying', { name: 'username', length: 15 })
    username: string;

    @ApiProperty({
        description: 'Número de teléfono',
        example: '1234567890'
    })
    @Column('character varying', { name: 'phone_number', length: 15 })
    phoneNumber: string;

    @ApiProperty({
        description: 'Contraseña encriptada (no se devuelve en respuestas)',
        example: '$2a$10$...'
    })
    @Column('character varying', { name: 'password', length: 100 })
    password: string;

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

    @ApiProperty({
        description: 'ID del estado del usuario',
        example: 1
    })
    @Column('int2', { name: 'state_id' })
    stateId: number;

    @ApiProperty({
        description: 'ID del rol del usuario',
        example: 2
    })
    @Column('int2', { name: 'role_id' })
    roleId: number;

    @ApiProperty({
        description: 'Envíos asociados al usuario',
        type: () => [Shipment],
        required: false
    })
    @OneToMany(() => Shipment, (shipment) => shipment.user)
    shipments: Shipment[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.id = uuidv7();
    }
}
