import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    //return this.generateToken(user);
  }

  async registerDriver(createUserDto: CreateUserDto) {
    //const user = await this.userService.createDriver(createUserDto);
   // return this.generateToken(user);
  }

  async login(email: string, password: string) {
    //const user = await this.userService.validateUser(email, password);
    //return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.idRole };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
