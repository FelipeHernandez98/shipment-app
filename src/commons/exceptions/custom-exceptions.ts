import { Client } from './../../client/entities/client.entity';
import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";


export class CustomExceptions {
    static UserNotFoundException(userId: string): NotFoundException {
        return new NotFoundException(`User with id ${userId} not found`);
    }

    static UserAlreadyExistsException(username: string): ConflictException {
        return new ConflictException(`User with username ${username} already exists`);
    }

    static InvalidCredentialsException(): UnauthorizedException {
        return new UnauthorizedException('Invalid username or password');
    }

    static ThereAreNoRecordsException(): NotFoundException {
        return new NotFoundException('There is no record');
    }

    static UnauthorizedException(): UnauthorizedException {
        return new UnauthorizedException('Username or password is incorrect');
    }

    static ClientAlreadyExistsException(documentNumber: string): ConflictException {
        return new ConflictException(`Client with document number ${documentNumber} already exists`);
    }

    static ClientNotFoundException(documentNumber: string): NotFoundException {
        return new NotFoundException(`Client with document number ${documentNumber} not found`);
    }
}