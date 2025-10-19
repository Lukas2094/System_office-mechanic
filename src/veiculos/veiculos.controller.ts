import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  create(@Body() dto: CreateVeiculoDto) {
    return this.veiculosService.create(dto);
  }

  @Get()
  findAll() {
    return this.veiculosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.veiculosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateVeiculoDto) {
    return this.veiculosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.veiculosService.remove(id);
  }
}
