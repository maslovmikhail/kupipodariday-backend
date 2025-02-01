import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Like, Repository } from 'typeorm';
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
    const { username, email, password } = createUserDto;
    const isUserExists = await this.usersRepository.exists({
      where: [{ username }, { email }],
    });
    if (isUserExists) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }
    const user = await this.usersRepository.save({
      ...createUserDto,
      password: await hashValue(password),
    });
    delete user.password;
    return user;
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

  async findUser(query: string) {
    return await this.usersRepository.find({
      where: [{ email: Like(`%${query}%`) }, { username: Like(`%${query}%`) }],
    });
  }
}
