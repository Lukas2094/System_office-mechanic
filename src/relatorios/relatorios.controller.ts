import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RelatoriosService } from './relatorios.service';
import { RelatorioFiltroDto } from './dto/filtro-relatorio.dto';
import * as XLSX from 'xlsx';

@Controller('relatorios')
export class RelatoriosController {
    constructor(private readonly relatoriosService: RelatoriosService) { }

    private exportar(dados: any, formato: string, nome: string, res: Response) {
        if (formato === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(dados);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, nome);
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Disposition', `attachment; filename="${nome}.xlsx"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            return res.send(buffer);
        }

  
        if (formato === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(dados);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Disposition', `attachment; filename = "${nome}.csv"`);
        res.setHeader('Content-Type', 'text/csv');
        return res.send(csv);
        }

        return res.json(dados);


    }

    @Get('ordens')
    async getRelatorioOrdens(@Query() filtro: RelatorioFiltroDto, @Res() res) {
        const dados = await this.relatoriosService.relatorioOrdens(filtro);
        const formato = (filtro as any).formato || 'json';
        return this.exportar(dados, formato, 'relatorio-ordens', res);
    }

    @Get('financeiro')
    async getRelatorioFinanceiro(@Query() filtro: RelatorioFiltroDto, @Res() res) {
        const dados = await this.relatoriosService.relatorioFinanceiro(filtro);
        const formato = (filtro as any).formato || 'json';
        return this.exportar([dados], formato, 'relatorio-financeiro', res);
    }

    @Get('produtividade')
    async getRelatorioProdutividade(@Query() filtro: RelatorioFiltroDto, @Res() res) {
        const dados = await this.relatoriosService.relatorioProdutividade(filtro);
        const formato = (filtro as any).formato || 'json';
        return this.exportar(dados, formato, 'relatorio-produtividade', res);
    }
}
