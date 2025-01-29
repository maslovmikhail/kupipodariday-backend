import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wishRepository: Repository<Wish>,
    private usersService: UsersService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number) {
    const owner = await this.usersService.findById(userId);
    const wish = await this.wishRepository.create({ ...createWishDto, owner });

    return await this.wishRepository.save(wish);
  }

  async findOneWish(query: FindOneOptions<Wish>) {
    return await this.wishRepository.findOneOrFail(query);
  }

  async findOne(ownerId: number) {
    return await this.wishRepository.find({
      where: { id: ownerId },
      relations: { owner: true, offers: true },
    });
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const { price } = updateWishDto;
    const wish = await this.wishRepository.findOne({
      where: { id: id },
      relations: ['owner'],
    });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Чужой подарок нельзя редактироват');
    }
    if (wish.raised > 0 && price) {
      throw new ConflictException(
        'Цену подарка нельзя редактировать, поскольку сбор средств уже идет',
      );
    }
    return this.wishRepository.save({ ...wish, ...updateWishDto });
  }

  async removeOne(wishId: number, userId: number) {
    const wish = await this.wishRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: wishId,
      },
    });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Чужой подарок нельзя удалить');
    }
    return this.wishRepository.remove(wish);
  }

  async findTop() {
    return await this.wishRepository.find({
      relations: { owner: true, offers: true },
      order: {
        copied: 'DESC',
      },
      take: 40,
    });
  }

  async findLast() {
    return await this.wishRepository.find({
      relations: { owner: true },
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.wishRepository.findOneBy({ id: wishId });
    const user = await this.usersRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });

    wish.copied = (wish.copied || 0) + 1;
    await this.wishRepository.save(wish);

    const isUserHasWish = user.wishes.some(
      (userWish) => userWish.id === wish.id,
    );
    if (isUserHasWish) {
      throw new Error('Подарок уже в коллекции');
    }

    user.wishes.push(wish);
    return await this.usersRepository.save(user);
  }
}
