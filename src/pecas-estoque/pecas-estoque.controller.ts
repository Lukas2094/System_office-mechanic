import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PecasEstoqueService } from './pecas-estoque.service';
import { CreatePecaEstoqueDto } from './dto/create-peca-estoque.dto';
import { UpdatePecaEstoqueDto } from './dto/update-peca-estoque.dto';

@Controller('pecas-estoque')
export class PecasEstoqueController {
  constructor(private readonly pecasEstoqueService: PecasEstoqueService) {}

  @Post()
  create(@Body() createPecaEstoqueDto: CreatePecaEstoqueDto) {
    return this.pecasEstoqueService.create(createPecaEstoqueDto);
  }

  @Get()
  findAll() {
    return this.pecasEstoqueService.findAll();
  }

  @Get('search')
  searchByName(@Query('nome') nome: string) {
    return this.pecasEstoqueService.searchByName(nome);
  }

  @Get('estoque-baixo')
  getEstoqueBaixo() {
    return this.pecasEstoqueService.getEstoqueBaixo();
  }

  @Get('estoque-zero')
  getEstoqueZero() {
    return this.pecasEstoqueService.getEstoqueZero();
  }

  @Get('estatisticas')
  getEstatisticas() {
    return this.pecasEstoqueService.getEstatisticas();
  }

  @Get('fornecedor/:fornecedorId')
  buscarPorFornecedor(@Param('fornecedorId', ParseIntPipe) fornecedorId: number) {
    return this.pecasEstoqueService.buscarPorFornecedor(fornecedorId);
  }

  @Get('codigo/:codigo')
  findByCodigoInterno(@Param('codigo') codigo: string) {
    return this.pecasEstoqueService.findByCodigoInterno(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pecasEstoqueService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePecaEstoqueDto: UpdatePecaEstoqueDto) {
    return this.pecasEstoqueService.update(id, updatePecaEstoqueDto);
  }

  @Patch(':id/estoque')
  async atualizarEstoque(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantidade: number; operacao: 'entrada' | 'saida' }
  ) {
    return this.pecasEstoqueService.atualizarEstoque(id, body.quantidade, body.operacao);
  }

  @Patch(':id/precos')
  async atualizarPreco(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { preco_custo: number; preco_venda: number }
  ) {
    return this.pecasEstoqueService.atualizarPreco(id, body.preco_custo, body.preco_venda);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pecasEstoqueService.remove(id);
  }
}