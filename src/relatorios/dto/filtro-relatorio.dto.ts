import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class RelatorioFiltroDto {
    @IsOptional()
    @IsString()
    dataInicio?: string;

    @IsOptional()
    @IsString()
    dataFim?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    clienteId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    funcionarioId?: number;
}
