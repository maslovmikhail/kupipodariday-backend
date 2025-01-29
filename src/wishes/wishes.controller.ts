import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AuthUser } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user) {
    return this.wishesService.create(createWishDto, user.id);
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  find(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOneWish({
      where: { id: id },
      relations: { owner: true, offers: true },
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    return this.wishesService.updateOne(id, updateWishDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@AuthUser() user: User, @Param('id') id: number) {
    return this.wishesService.removeOne(user.id, +id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copy(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.copy(id, user.id);
  }
}
