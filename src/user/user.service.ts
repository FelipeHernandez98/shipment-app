import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CustomExceptions } from 'src/commons/exceptions/custom-exceptions';
import { StatesEnum } from 'src/commons/enums/states.enum';
import { JwtPayload } from 'src/commons/interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { username: createUserDto.username } });
    if (existingUser) {
      throw CustomExceptions.UserAlreadyExistsException(createUserDto.username);
    }
    const user = this.userRepository.create({
      ...createUserDto,
      stateId: StatesEnum.ACTIVE,
      createdAt: new Date(),
      roleId: 1
    });
    user.password = await bcrypt.hash(user.password, 10);
    delete user.password;
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (users.length === 0) {
      throw CustomExceptions.ThereAreNoRecordsException();
    }
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw CustomExceptions.UserNotFoundException(id);
    }
    delete user.password;
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, { ...updateUserDto });
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw CustomExceptions.UserNotFoundException(id);
    }
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw CustomExceptions.UserNotFoundException(id);
    }
  }

  async login(loginUserDto: LoginUserDto){
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: {username}, 
      select: { username: true, password: true, id: true, roleId: true }
    });

    if( !user )
      CustomExceptions.UnauthorizedException();

    const response = await bcrypt.compare(password, user.password);

    if( !response )
      throw CustomExceptions.UnauthorizedException();

    return {
      token: this.getJwtToken({ id: user.id, roleId: user.roleId })
    }
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, roleId: user.roleId })
    }
  }

  private getJwtToken( payload: JwtPayload ){
    const token = this.jwtService.sign( payload );
    return token;
  }
}
