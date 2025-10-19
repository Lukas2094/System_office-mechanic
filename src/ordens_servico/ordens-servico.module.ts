import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdensServicoService } from './ordens-servico.service';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoGateway } from './ordens-servico.gateway';
import { OrdemServico } from './entities/ordem-servico.entity';
import { Cliente } from '@/clientes/entities/cliente.entity';
import { Veiculo } from '@/veiculos/entities/veiculo.entity';
import { Funcionario } from '@/funcionarios/entities/funcionario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdemServico, Cliente, Veiculo, Funcionario])],
  controllers: [OrdensServicoController],
  providers: [OrdensServicoService, OrdensServicoGateway],
  exports: [OrdensServicoService],
})
export class OrdensServicoModule {}
