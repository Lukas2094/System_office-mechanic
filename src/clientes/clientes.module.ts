import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClientesGateway } from './clientes.gateway';
import { Cliente } from './entities/cliente.entity';
import { Veiculo } from '@/veiculos/entities/veiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Veiculo])],
  controllers: [ClientesController],
  providers: [ClientesService, ClientesGateway],
  exports: [ClientesService],
})
export class ClientesModule {}
