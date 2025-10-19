import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}