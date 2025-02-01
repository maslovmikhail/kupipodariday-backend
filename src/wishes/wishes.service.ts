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
    @InjectRepository(Wish) private wishesRepository: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number) {
    const owner = await this.usersService.findById(userId);
    const wish = await this.wishesRepository.create({
      ...createWishDto,
      owner,
    });

    return await this.wishesRepository.save(wish);
  }

  async findOneWish(query: FindOneOptions<Wish>) {
    return await this.wishesRepository.findOneOrFail(query);
  }

  async findOne(ownerId: number) {
    return await this.wishesRepository.find({
      where: { id: ownerId },
      relations: { owner: true, offers: true },
    });
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const { price } = updateWishDto;
    const wish = await this.wishesRepository.findOne({
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
    return this.wishesRepository.save({ ...wish, ...updateWishDto });
  }

  async removeOne(userId: number, wishId: number) {
    const wish = await this.wishesRepository.findOne({
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
    return this.wishesRepository.remove(wish);
  }

  async findTop() {
    return await this.wishesRepository.find({
      relations: { owner: true, offers: true },
      order: {
        copied: 'DESC',
      },
      take: 40,
    });
  }

  async findLast() {
    return await this.wishesRepository.find({
      relations: { owner: true },
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });

    const isUserHasWish = await this.wishesRepository.findOneBy({
      name: wish.name,
      owner: { id: userId },
    });
    if (isUserHasWish) {
      throw new ConflictException('Подарок уже в коллекции');
    }
    if (wish.owner.id === userId) {
      throw new ConflictException('Нельзя копировать свой собственный подарок');
    }

    wish.copied += 1;
    await this.wishesRepository.save(wish);
    const copiedWish = this.wishesRepository.create({
      ...wish,
      id: undefined,
      owner: { id: userId },
      copied: 0,
      raised: 0,
    });

    return await this.wishesRepository.save(copiedWish);
  }
}
