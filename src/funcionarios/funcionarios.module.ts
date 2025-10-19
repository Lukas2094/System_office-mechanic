import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuncionariosService } from './funcionarios.service';
import { FuncionariosController } from './funcionarios.controller';
import { Funcionario } from './entities/funcionario.entity';
import { FuncionariosGateway } from './funcionarios.gateway';
import { Cargo } from '@/cargos/entities/cargo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Funcionario, Cargo])],
  controllers: [FuncionariosController],
  providers: [FuncionariosService, FuncionariosGateway],
  exports: [FuncionariosService],
})
export class FuncionariosModule {}
