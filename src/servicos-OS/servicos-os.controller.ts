import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ServicosOsService } from './servicos-os.service';
import { CreateServicoOsDto } from './dto/create-servico-os.dto';
import { UpdateServicoOsDto } from './dto/update-servico-os.dto';

@Controller('servicos-os')
export class ServicosOsController {
  constructor(private readonly servicosOsService: ServicosOsService) {}

  @Post()
  create(@Body() createServicoOsDto: CreateServicoOsDto) {
    return this.servicosOsService.create(createServicoOsDto);
  }

  @Get()
  findAll() {
    return this.servicosOsService.findAll();
  }

  @Get('ordem/:ordemId')
  findByOrdemId(@Param('ordemId', ParseIntPipe) ordemId: number) {
    return this.servicosOsService.findByOrdemId(ordemId);
  }

  @Get('total-ordem/:ordemId')
  async calcularTotalOrdem(@Param('ordemId', ParseIntPipe) ordemId: number) {
    const total = await this.servicosOsService.calcularTotalOrdem(ordemId);
    return { ordem_id: ordemId, total };
  }

  @Get('contagem-tipo/:ordemId')
  async contarPorTipo(@Param('ordemId', ParseIntPipe) ordemId: number) {
    return this.servicosOsService.contarPorTipo(ordemId);
  }

  @Get('estatisticas/:ordemId')
  async getEstatisticasOrdem(@Param('ordemId', ParseIntPipe) ordemId: number) {
    const [servicos, total, contagem] = await Promise.all([
      this.servicosOsService.findByOrdemId(ordemId),
      this.servicosOsService.calcularTotalOrdem(ordemId),
      this.servicosOsService.contarPorTipo(ordemId)
    ]);

    return {
      ordem_id: ordemId,
      total,
      contagem,
      quantidade_itens: servicos.length,
      servicos: servicos
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicosOsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateServicoOsDto: UpdateServicoOsDto) {
    return this.servicosOsService.update(id, updateServicoOsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicosOsService.remove(id);
  }

  @Delete('ordem/:ordemId')
  async removeAllByOrdemId(@Param('ordemId', ParseIntPipe) ordemId: number) {
    return this.servicosOsService.removeAllByOrdemId(ordemId);
  }
}