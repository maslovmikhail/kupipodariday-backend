import { IsEmail, IsOptional, IsUrl, Length, MinLength } from 'class-validator';

export class UpdateUserDto {
  @Length(2, 30)
  @IsOptional()
  username: string;

  @Length(2, 200)
  @IsOptional()
  about: string;

  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @MinLength(6)
  @IsOptional()
  password: string;
}
