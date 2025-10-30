import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { OrdemServico } from '@/ordens_servico/entities/ordem-servico.entity';
import { ServicoOs } from '@/servicos-OS/entities/servico-os.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Veiculo } from '../veiculos/entities/veiculo.entity';
import { Funcionario } from '../funcionarios/entities/funcionario.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrdemServico,
            ServicoOs,
            Cliente,
            Veiculo,
            Funcionario,
        ]),
    ],
    controllers: [RelatoriosController],
    providers: [RelatoriosService],
    exports: [RelatoriosService],
})
export class RelatoriosModule { }
