import { IsString, IsInt, IsBoolean, IsOptional, MinLength, MaxLength, IsNotEmpty, Min } from 'class-validator';

export class CreateUsuarioDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  funcionario_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cargo_id?: number;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  senha: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}