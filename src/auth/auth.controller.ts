import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('register-driver')
  @ApiResponse({ status: 201, description: 'The driver has been successfully registered.' })
  async registerDriver(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerDriver(createUserDto);
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'The user has been successfully logged in.' })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
