import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrdensServicoService } from './ordens-servico.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';

@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(private readonly ordensService: OrdensServicoService) {}

  @Post()
  create(@Body() dto: CreateOrdemServicoDto) {
    return this.ordensService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordensService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateOrdemServicoDto) {
    return this.ordensService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordensService.remove(+id);
  }

  @Put(':id/faturar')
  faturar(@Param('id') id: number) {
    return this.ordensService.faturar(+id);
  }
}
