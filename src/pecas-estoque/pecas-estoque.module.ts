import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PecasEstoqueService } from './pecas-estoque.service';
import { PecasEstoqueController } from './pecas-estoque.controller';
import { PecasEstoqueGateway } from './pecas-estoque.gateway';
import { PecaEstoque } from './entities/peca-estoque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PecaEstoque]),
  ],
  controllers: [PecasEstoqueController],
  providers: [PecasEstoqueService, PecasEstoqueGateway],
  exports: [PecasEstoqueService],
})
export class PecasEstoqueModule {}