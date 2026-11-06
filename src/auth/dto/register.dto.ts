import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SELLER = 'seller',
}

export class RegisterDto {
  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Doe',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'Função do usuário',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  role!: Role;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
