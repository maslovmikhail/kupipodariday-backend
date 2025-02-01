import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { EntityNotFoundFilter } from 'src/common/filters/entity-not-found-exception.filter';
import { Wish } from 'src/wishes/entities/wish.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getOwnUser(@AuthUser() user) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @UseFilters(EntityNotFoundFilter)
  updateOne(@AuthUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(user.id, updateUserDto);
  }

  @Get('me/wishes')
  findMyWishes(@AuthUser() user: User): Promise<Wish[]> {
    return this.usersService.getUsersWishes(user.username);
  }

  @Get(':username')
  findOne(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUserName(username);
  }

  @Get(':username/wishes')
  getUserWishes(@Param('username') username: string) {
    return this.usersService.getUsersWishes(username);
  }

  @Post('find')
  findUser(@Body('query') query: string) {
    return this.usersService.findUser(query);
  }
}
