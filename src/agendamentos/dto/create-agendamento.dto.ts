import { IsInt, IsDateString, IsEnum, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  @Min(1)
  cliente_id: number;

  @IsInt()
  @Min(1)
  veiculo_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  funcionario_id?: number;

  @IsDateString()
  @IsNotEmpty()
  data_agendamento: Date;

  @IsOptional()
  @IsEnum(['pendente', 'confirmado', 'concluido', 'cancelado'])
  status?: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

  @IsOptional()
  @IsString()
  observacoes?: string;
}