import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CargosService } from './cargos.service';
import { Cargo } from './entities/cargo.entity';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  findAll(): Promise<Cargo[]> {
    return this.cargosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Cargo> {
    return this.cargosService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Cargo>): Promise<Cargo> {
    return this.cargosService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Cargo>): Promise<Cargo> {
    return this.cargosService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.cargosService.remove(id);
  }
}
