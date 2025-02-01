import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishlistDto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const wishes = await this.wishRepository.findBy({
      id: In(createWishlistDto.itemsId),
    });
    if (wishes.length !== itemsId.length) {
      throw new NotFoundException('Один или несколько подарков не найдены');
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });

    return this.wishlistRepository.save(wishlist);
  }

  async findAll() {
    return await this.wishlistRepository.find({
      relations: { owner: true },
    });
  }

  async findOne(id: number) {
    return await this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id: id,
      },
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: id,
      },
    });

    if (wishList.owner.id !== userId) {
      throw new BadRequestException(
        'Вишлист может редактировать только владелец',
      );
    }

    return this.wishlistRepository.update(wishList, {
      ...updateWishlistDto,
    });
  }

  async remove(id: number, userId: number) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: id,
      },
    });

    if (wishList.owner.id !== userId) {
      throw new BadRequestException('Вишлист может удалить только владелец');
    }

    return await this.wishlistRepository.remove(wishList);
  }
}
