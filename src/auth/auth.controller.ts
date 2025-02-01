import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@AuthUser() user) {
    return this.authService.authenticate(user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }
}
