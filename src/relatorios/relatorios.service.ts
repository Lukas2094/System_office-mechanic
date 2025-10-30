// relatorios.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RelatorioFiltroDto } from './dto/filtro-relatorio.dto';

@Injectable()
export class RelatoriosService {
    constructor(private readonly dataSource: DataSource) { }

    async relatorioOrdens(filtro: RelatorioFiltroDto) {
        const qb = this.dataSource
            .createQueryBuilder()
            .select([
                'os.id AS ordem_id',
                'cli.nome AS cliente',
                'f.nome AS funcionario',
                'v.placa AS veiculo',
                'os.status',
                'os.valor_total',
                'os.data_abertura',
                'os.data_fechamento',
            ])
            .from('ordens_servico', 'os')
            .leftJoin('clientes', 'cli', 'cli.id = os.cliente_id')
            .leftJoin('funcionarios', 'f', 'f.id = os.funcionario_id')
            .leftJoin('veiculos', 'v', 'v.id = os.veiculo_id')
            .where('1=1');

        if (filtro.dataInicio) qb.andWhere('os.data_abertura >= :dataInicio', { dataInicio: filtro.dataInicio });
        if (filtro.dataFim) qb.andWhere('os.data_fechamento <= :dataFim', { dataFim: filtro.dataFim });
        if (filtro.status) qb.andWhere('os.status = :status', { status: filtro.status });
        if (filtro.funcionarioId) qb.andWhere('os.funcionario_id = :funcionarioId', { funcionarioId: filtro.funcionarioId });
        if (filtro.clienteId) qb.andWhere('os.cliente_id = :clienteId', { clienteId: filtro.clienteId });

        return qb.orderBy('os.data_abertura', 'DESC').getRawMany();
    }

    async relatorioFinanceiro(filtro: RelatorioFiltroDto) {
        const qb = this.dataSource
            .createQueryBuilder()
            .select('SUM(os.valor_total)', 'total_faturado')
            .addSelect('COUNT(os.id)', 'total_ordens')
            .from('ordens_servico', 'os')
            .where('os.status IN (:...status)', { status: ['concluida', 'faturada'] });

        if (filtro.dataInicio) qb.andWhere('os.data_abertura >= :dataInicio', { dataInicio: filtro.dataInicio });
        if (filtro.dataFim) qb.andWhere('os.data_fechamento <= :dataFim', { dataFim: filtro.dataFim });

        return qb.getRawOne();
    }

    async relatorioProdutividade(filtro: RelatorioFiltroDto) {
        return this.dataSource.query(`
      SELECT f.nome AS funcionario, COUNT(os.id) AS total_ordens, SUM(os.valor_total) AS total_valor
      FROM ordens_servico os
      JOIN funcionarios f ON f.id = os.funcionario_id
      WHERE os.status IN ('concluida', 'faturada')
      ${filtro.dataInicio ? `AND os.data_abertura >= '${filtro.dataInicio}'` : ''}
      ${filtro.dataFim ? `AND os.data_fechamento <= '${filtro.dataFim}'` : ''}
      GROUP BY f.id
      ORDER BY total_ordens DESC;
    `);
    }
}
