import { UserDto as SharedUserDto } from '@frost-logix/shared-types';

export class UserDto implements SharedUserDto {
  id!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  created_at!: string;
}

