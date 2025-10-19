import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Get()
  findAll() {
    return this.agendamentosService.findAll();
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.agendamentosService.findByCliente(clienteId);
  }

  @Get('funcionario/:funcionarioId')
  findByFuncionario(@Param('funcionarioId', ParseIntPipe) funcionarioId: number) {
    return this.agendamentosService.findByFuncionario(funcionarioId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    const allowedStatuses = ['pendente', 'confirmado', 'concluido', 'cancelado'] as const;
    if (!allowedStatuses.includes(status as any)) {
      throw new Error(`Status inválido: ${status}`);
    }
    return this.agendamentosService.findByStatus(status as typeof allowedStatuses[number]);
  }

  @Get('periodo')
  findByPeriodo(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string
  ) {
    return this.agendamentosService.findByPeriodo(new Date(dataInicio), new Date(dataFim));
  }

  @Get('hoje')
  getAgendamentosHoje() {
    return this.agendamentosService.getAgendamentosHoje();
  }

  @Get('futuros')
  getAgendamentosFuturos() {
    return this.agendamentosService.getAgendamentosFuturos();
  }

  @Get('estatisticas')
  getEstatisticas() {
    return this.agendamentosService.getEstatisticas();
  }

  @Get('search')
  searchByClienteNome(@Query('nome') nome: string) {
    return this.agendamentosService.searchByClienteNome(nome);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAgendamentoDto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Patch(':id/status')
  atualizarStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: string }) {
    const allowedStatuses = ['pendente', 'confirmado', 'concluido', 'cancelado'] as const;
    if (!allowedStatuses.includes(body.status as any)) {
      throw new Error(`Status inválido: ${body.status}`);
    }
    return this.agendamentosService.atualizarStatus(id, body.status as typeof allowedStatuses[number]);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.remove(id);
  }
}