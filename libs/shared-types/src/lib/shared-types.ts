export interface UserDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface CreateUserDto {
  email: string;
  first_name: string;
  last_name: string;
}
