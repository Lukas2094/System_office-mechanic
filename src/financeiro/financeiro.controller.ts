import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  create(@Body() createFinanceiroDto: CreateFinanceiroDto) {
    return this.financeiroService.create(createFinanceiroDto);
  }

  @Get()
  findAll() {
    return this.financeiroService.findAll();
  }

  @Get('periodo')
  findByPeriodo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string
  ) {
    return this.financeiroService.findByPeriodo(new Date(dataInicio), new Date(dataFim));
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: 'receita' | 'despesa') {
    return this.financeiroService.findByTipo(tipo);
  }

  @Get('ordem/:ordemId')
  findByOrdemId(@Param('ordemId', ParseIntPipe) ordemId: number) {
    return this.financeiroService.findByOrdemId(ordemId);
  }

  @Get('totais')
  async calcularTotalPorTipo(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : undefined;
    const fim = dataFim ? new Date(dataFim) : undefined;
    
    return this.financeiroService.calcularTotalPorTipo(inicio, fim);
  }

  @Get('formas-pagamento')
  async calcularTotalPorFormaPagamento(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : undefined;
    const fim = dataFim ? new Date(dataFim) : undefined;
    
    return this.financeiroService.calcularTotalPorFormaPagamento(inicio, fim);
  }

  @Get('estatisticas')
  async getEstatisticas(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string
  ) {
    const inicio = dataInicio ? new Date(dataInicio) : undefined;
    const fim = dataFim ? new Date(dataFim) : undefined;
    
    const [movimentos, totais, formasPagamento] = await Promise.all([
      this.financeiroService.findByPeriodo(inicio || new Date('2000-01-01'), fim || new Date()),
      this.financeiroService.calcularTotalPorTipo(inicio, fim),
      this.financeiroService.calcularTotalPorFormaPagamento(inicio, fim)
    ]);

    return {
      periodo: { dataInicio: inicio, dataFim: fim },
      totais,
      formas_pagamento: formasPagamento,
      quantidade_movimentos: movimentos.length,
      movimentos
    };
  }

  @Post('ordem/:ordemId/receita')
  async criarReceitaDeOrdem(
    @Param('ordemId', ParseIntPipe) ordemId: number,
    @Body() body: { valor: number; forma_pagamento: string; descricao?: string }
  ) {
    return this.financeiroService.criarReceitaDeOrdem(
      ordemId, 
      body.valor, 
      body.forma_pagamento, 
      body.descricao
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFinanceiroDto: UpdateFinanceiroDto) {
    return this.financeiroService.update(id, updateFinanceiroDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.financeiroService.remove(id);
  }
}