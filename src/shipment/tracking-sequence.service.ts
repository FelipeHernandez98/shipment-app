import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TrackingSequence } from './entities/tracking-sequence.entity';

@Injectable()
export class TrackingSequenceService {
  constructor(
    @InjectRepository(TrackingSequence)
    private trackingSequenceRepository: Repository<TrackingSequence>,
    private dataSource: DataSource,
  ) {}

  /**
   * Genera un código de seguimiento con formato: DDMMYYYYNNNNNNN
   * DD = día, MM = mes, YYYY = año, NNNNNNN = consecutivo de 7 dígitos
   */
  async generateTrackingCode(): Promise<string> {
    // Usar una transacción para garantizar atomicidad y evitar race conditions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

      // Bloquear y obtener el registro del día (SELECT FOR UPDATE)
      let trackingSeq = await queryRunner.manager.findOne(TrackingSequence, {
        where: { sequenceDate: dateString },
        lock: { mode: 'pessimistic_write' }, // Bloquea el registro para evitar race conditions
      });

      // Si no existe, crear uno nuevo
      if (!trackingSeq) {
        trackingSeq = queryRunner.manager.create(TrackingSequence, {
          sequenceDate: dateString,
          currentSequence: 0,
        });
        trackingSeq = await queryRunner.manager.save(trackingSeq);
      }

      // Incrementar el consecutivo
      trackingSeq.currentSequence += 1;
      trackingSeq.updatedAt = new Date();
      await queryRunner.manager.save(trackingSeq);

      // Confirmar la transacción
      await queryRunner.commitTransaction();

      // Generar el código: DDMMYYYYNNNNNNN
      const sequence = String(trackingSeq.currentSequence).padStart(7, '0');
      const trackingCode = `${day}${month}${year}${sequence}`;

      return trackingCode;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al generar código de seguimiento: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene el consecutivo actual del día (útil para debugging)
   */
  async getCurrentSequence(date?: Date): Promise<number> {
    const today = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const trackingSeq = await this.trackingSequenceRepository.findOne({
      where: { sequenceDate: today },
    });
    return trackingSeq?.currentSequence || 0;
  }
}
