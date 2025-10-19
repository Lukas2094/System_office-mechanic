import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(['PF', 'PJ'])
  tipo: 'PF' | 'PJ';

  @IsString()
  @Length(11, 18)
  cpf_cnpj: string;

  @IsOptional()
  telefone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  endereco?: string;

  @IsOptional()
  cidade?: string;

  @IsOptional()
  estado?: string;

  @IsOptional()
  cep?: string;
}
