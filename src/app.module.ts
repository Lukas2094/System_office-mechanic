import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { OrdensServicoModule } from './ordens_servico/ordens-servico.module';
import { CargosModule } from './cargos/cargos.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { ServicosOsModule } from './servicos-OS/servicos-os.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { PecasEstoqueModule } from './pecas-estoque/pecas-estoque.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UploadsModule } from './uploads/uploads.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    // Carrega o .env automaticamente
    ConfigModule.forRoot({
      isGlobal: true, // disponível em todos os módulos
    }),

    // Configuração do banco MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // mantenha false em produção
    }),

    ClientesModule,
    VeiculosModule,
    OrdensServicoModule,
    CargosModule,
    FuncionariosModule,
    ServicosOsModule,
    FinanceiroModule,
    PecasEstoqueModule,
    AgendamentosModule,
    UploadsModule,
    UsuariosModule,
    RelatoriosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
