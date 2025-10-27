import { IsInt, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateServicoOsDto {
  @IsInt()
  @Min(1)
  ordem_id: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor_unitario?: number;

  @IsOptional()
  @IsEnum(['servico', 'peca'])
  tipo?: 'servico' | 'peca';
}