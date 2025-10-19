import { IsInt, IsString, IsDecimal, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateServicoOsDto {
  @IsInt()
  @Min(1)
  ordem_id: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  valor_unitario?: number;

  @IsOptional()
  @IsEnum(['servico', 'peca'])
  tipo?: 'servico' | 'peca';
}