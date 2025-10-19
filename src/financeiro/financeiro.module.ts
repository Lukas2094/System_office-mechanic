import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroGateway } from './financeiro.gateway';
import { Financeiro } from './entities/financeiro.entity';
import { OrdensServicoModule } from '../ordens_servico/ordens-servico.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Financeiro]),
    OrdensServicoModule,
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService, FinanceiroGateway],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}