import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosGateway } from './agendamentos.gateway';
import { Agendamento } from './entities/agendamento.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento]),
    ClientesModule,
    VeiculosModule,
    FuncionariosModule,
  ],
  controllers: [AgendamentosController],
  providers: [AgendamentosService, AgendamentosGateway],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}