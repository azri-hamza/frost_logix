import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateUserDto as SharedCreateUserDto } from '@frost-logix/shared-types';

export class CreateUserDto implements SharedCreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @IsNotEmpty()
  last_name!: string;

  @IsString()
  @IsOptional()
  password?: string;
}

