import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicosOsService } from './servicos-os.service';
import { ServicosOsController } from './servicos-os.controller';
import { ServicosOsGateway } from './servicos-os.gateway';
import { ServicoOs } from './entities/servico-os.entity';
import { OrdensServicoModule } from '../ordens_servico/ordens-servico.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicoOs]),
    OrdensServicoModule,
  ],
  controllers: [ServicosOsController],
  providers: [ServicosOsService, ServicosOsGateway],
  exports: [ServicosOsService],
})
export class ServicosOsModule {}