import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomExceptions } from 'src/commons/exceptions/custom-exceptions';

@Injectable()
export class ClientService {

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>
  ) {}

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({ where: { documentNumber: createClientDto.documentNumber } });
    if (existingClient) {
      throw CustomExceptions.ClientAlreadyExistsException(createClientDto.documentNumber);
    }

    const client = this.clientRepository.create({ ...createClientDto, createdAt: new Date() });
    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository.find();
    if (clients.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return clients;
  }

  async findOne(documentNumber: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { documentNumber } });
    if (!client) {
      throw CustomExceptions.UserNotFoundException(documentNumber);
    }
    return client;
  }

  async update(documentNumber: string, updateClientDto: UpdateClientDto) {
    await this.clientRepository.update(documentNumber, { ...updateClientDto, updatedAt: new Date() });
    const updatedClient = await this.findOne(documentNumber);
    if (!updatedClient) {
      throw CustomExceptions.ClientNotFoundException(documentNumber);
    }
    return updatedClient;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw CustomExceptions.ClientNotFoundException(id);
    }
  }

}
