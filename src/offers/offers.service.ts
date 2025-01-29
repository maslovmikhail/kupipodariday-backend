import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishsRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const { amount, itemId } = createOfferDto;

    const owner = await this.usersRepository.findOneBy({ id: userId });
    const wish = await this.wishsRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'offers'],
    });

    if (userId === wish.owner.id) {
      throw new ForbiddenException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }

    const raised = Number(wish.raised) + Number(amount);
    if (raised > wish.price) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }
    wish.raised += amount;

    await this.wishsRepository.update(itemId, { raised: raised });

    return this.offersRepository.save({
      ...createOfferDto,
      owner: owner,
      item: wish,
    });
  }

  async findAll() {
    return await this.offersRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.offersRepository.findOneBy({ id });
  }
}
