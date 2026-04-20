import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto as SharedCreateUserDto, UserDto } from '@frost-logix/shared-types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      created_at: u.created_at.toISOString(),
    }));
  }

  async create(data: SharedCreateUserDto & { password?: string }): Promise<UserDto> {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : '';

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.user.delete({where: {id}});
    return true;
  }

  async findByEmail(email: string): Promise<{ id: string; email: string; password: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
    return user;
  }


}

