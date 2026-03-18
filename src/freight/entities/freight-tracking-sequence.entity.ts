import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('freight_tracking_sequence', { schema: 'shipmentschema' })
@Unique(['sequenceDate'])
export class FreightTrackingSequence {
  @PrimaryColumn('date', { name: 'sequence_date' })
  sequenceDate: string;

  @Column('bigint', { name: 'current_sequence', default: 0 })
  currentSequence: number;

  @Column('timestamp with time zone', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
