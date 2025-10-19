import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { UploadsGateway } from './uploads.gateway';
import { Upload } from './entities/upload.entity';
import { OrdensServicoModule } from '../ordens_servico/ordens-servico.module';
import { ClientesModule } from '../clientes/clientes.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upload]),
    OrdensServicoModule,
    ClientesModule,
    UsuariosModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsGateway],
  exports: [UploadsService],
})
export class UploadsModule {}