import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clientesService.findOne(+id);
  }

  @Get(':id/veiculos')
    findVeiculos(@Param('id') id: number) {
      return this.clientesService.findByCliente(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.clientesService.remove(+id);
  }
}
