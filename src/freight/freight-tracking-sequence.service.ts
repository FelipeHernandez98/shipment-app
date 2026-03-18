import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FreightTrackingSequence } from './entities/freight-tracking-sequence.entity';

@Injectable()
export class FreightTrackingSequenceService {
  constructor(
    @InjectRepository(FreightTrackingSequence)
    private readonly freightTrackingSequenceRepository: Repository<FreightTrackingSequence>,
    private readonly dataSource: DataSource,
  ) {}

  async generateGuideCode(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const sequenceRepository = queryRunner.manager.getRepository(FreightTrackingSequence);
      let sequence = await sequenceRepository.findOne({
        where: { sequenceDate: dateString },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sequence) {
        sequence = sequenceRepository.create({
          sequenceDate: dateString,
          currentSequence: 0,
        });
        sequence = await sequenceRepository.save(sequence);
      }

      sequence.currentSequence = Number(sequence.currentSequence) + 1;
      sequence.updatedAt = new Date();
      await sequenceRepository.save(sequence);

      await queryRunner.commitTransaction();

      const paddedSequence = String(sequence.currentSequence).padStart(7, '0');
      return `FT-${day}${month}${year}${paddedSequence}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al generar codigo de guia de flete: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getCurrentSequence(date?: Date): Promise<number> {
    const targetDate = date ?? new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const sequence = await this.freightTrackingSequenceRepository.findOne({
      where: { sequenceDate: dateString },
    });

    return Number(sequence?.currentSequence ?? 0);
  }
}
