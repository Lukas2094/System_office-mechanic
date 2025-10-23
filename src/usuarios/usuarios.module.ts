import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { UsuariosGateway } from './usuarios.gateway';
import { Usuario } from './entities/usuario.entity';
import { JwtStrategy } from '@/jwt-guards/jwt.strategy';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';
import { CargosModule } from '../cargos/cargos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Usuario]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    FuncionariosModule,
    CargosModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosGateway, JwtStrategy],
  exports: [UsuariosService, JwtStrategy],
})
export class UsuariosModule {}