import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';
import { CargosController } from './cargos.controller';
import { CargosService } from './cargos.service';
import { CargosGateway } from './cargos.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo])],
  controllers: [CargosController],
  providers: [CargosService, CargosGateway],
  exports: [CargosService],
})
export class CargosModule {}
