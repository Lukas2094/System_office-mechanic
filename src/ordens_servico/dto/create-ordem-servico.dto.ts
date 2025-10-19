import { IsInt, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateOrdemServicoDto {
  @IsInt()
  cliente_id: number;

  @IsInt()
  veiculo_id: number;

  @IsOptional()
  @IsInt()
  funcionario_id?: number;

  @IsOptional()
  @IsEnum(['aberta', 'em_andamento', 'concluida', 'faturada', 'cancelada'])
  status?: 'aberta' | 'em_andamento' | 'concluida' | 'faturada' | 'cancelada';

  @IsOptional()
  observacoes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor_total?: number;
}
