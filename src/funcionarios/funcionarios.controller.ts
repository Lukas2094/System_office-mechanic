import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  @Post()
  create(@Body() dto: CreateFuncionarioDto) {
    return this.funcionariosService.create(dto);
  }

  @Get()
  findAll() {
    return this.funcionariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.funcionariosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFuncionarioDto) {
    return this.funcionariosService.update(id, dto);
  }

  @Put(':id/cargo')
  async setCargo(@Param('id') id: number, @Body() body: { cargo_id: number | null }) {
    return this.funcionariosService.setCargo(+id, body.cargo_id ?? null);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.funcionariosService.remove(id);
  }
}
