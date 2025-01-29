import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hashValue } from 'src/helpers/hash';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: await hashValue(password),
    });
    return this.usersRepository.save(user);
  }

  async findById(id: number) {
    return await this.usersRepository.findOneBy({ id: id });
  }

  async findOne(query: FindOneOptions<User>) {
    return await this.usersRepository.findOneOrFail(query);
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    const { password } = updateUserDto;
    const user = await this.findById(id);
    if (password) {
      updateUserDto.password = await hashValue(password);
    }

    return this.usersRepository.save({ ...user, ...updateUserDto });
  }

  async findByUserName(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    return user;
  }

  async getUsersWishes(username: string) {
    const userWishes = await this.usersRepository.findOne({
      where: { username: username },
      relations: { wishes: true, offers: true },
    });
    const wishes = userWishes.wishes;
    return wishes;
  }

  async findUser(query: FindOneOptions<User>) {
    return await this.usersRepository.find(query);
  }
}
