import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.username)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.name)
  item: Wish;

  @Column({ precision: 2 })
  amount: number;

  @Column({
    default: false,
  })
  hidden: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
