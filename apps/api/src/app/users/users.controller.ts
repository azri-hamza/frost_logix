import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return this.usersService.delete(id);
  }
}
