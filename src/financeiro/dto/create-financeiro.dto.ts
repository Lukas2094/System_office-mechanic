import { IsEnum, IsString, IsDecimal, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateFinanceiroDto {
  @IsEnum(['receita', 'despesa'])
  tipo: 'receita' | 'despesa';

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsDecimal()
  @Min(0.01)
  valor: number;

  @IsDateString()
  data_movimento: Date;

  @IsOptional()
  @IsEnum(['dinheiro', 'cartao', 'pix', 'boleto'])
  forma_pagamento?: 'dinheiro' | 'cartao' | 'pix' | 'boleto';

  @IsOptional()
  @IsInt()
  ordem_id?: number;
}