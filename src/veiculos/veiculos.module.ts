import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculosService } from './veiculos.service';
import { VeiculosController } from './veiculos.controller';
import { Veiculo } from './entities/veiculo.entity';
import { Cliente } from '@/clientes/entities/cliente.entity';
import { VeiculosGateway } from './veiculos.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Veiculo, Cliente]),
  ],
  controllers: [VeiculosController],
  providers: [
    VeiculosService,
    VeiculosGateway,
  ],
  exports: [
    VeiculosService,
    VeiculosGateway, 
  ],
})
export class VeiculosModule {}