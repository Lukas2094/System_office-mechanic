import { IsString, IsInt, IsDecimal, IsOptional, Min, IsNumber } from 'class-validator';

export class CreatePecaEstoqueDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  codigo_interno?: string;

  @IsOptional()
  @IsString()
  codigo_fornecedor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  preco_custo?: number;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  preco_venda?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estoque_minimo?: number;

  @IsOptional()
  @IsInt()
  fornecedor_id?: number;
}