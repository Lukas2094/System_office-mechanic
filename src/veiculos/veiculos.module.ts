import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veiculo } from './entities/veiculo.entity';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';
import { VeiculosGateway } from './veiculos.gateway';
import { Cliente } from '@/clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo, Cliente])],
  controllers: [VeiculosController],
  providers: [VeiculosService, VeiculosGateway],
  exports: [VeiculosService],
})
export class VeiculosModule {}
