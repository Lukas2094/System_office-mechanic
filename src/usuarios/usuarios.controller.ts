import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtAuthGuard } from '@/jwt-guards/jwt-auth.guard';
import { UsuariosGateway } from './usuarios.gateway';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly gateway: UsuariosGateway,
  ) { }

  @Post('login')
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    const result = await this.usuariosService.login(loginUsuarioDto);
    this.gateway.server.emit('usuario:login', { username: loginUsuarioDto.username });
    return result;
  }

  @Post('create')
  // @UseGuards(JwtAuthGuard)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);

    // 🔥 Notifica todos os clientes WebSocket
    this.gateway.server.emit('usuario:created', usuario);

    return usuario;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    this.gateway.server.emit('usuario:list', usuarios);
    return usuarios;
  }

  @Get('estatisticas')
  @UseGuards(JwtAuthGuard)
  async getEstatisticas() {
    const estatisticas = await this.usuariosService.getEstatisticas();
    this.gateway.server.emit('usuario:estatisticas', estatisticas);
    return estatisticas;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.usuariosService.findOne(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Get('username/:username')
  @UseGuards(JwtAuthGuard)
  async findByUsername(@Param('username') username: string) {
    return this.usuariosService.findByUsername(username);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);

    // 🔥 Notifica todos os sockets
    this.gateway.server.emit('usuario:updated', usuario);

    return usuario;
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    const result = await this.usuariosService.requestPasswordReset(body.email);
    return result;
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const result = await this.usuariosService.resetPassword(body.token, body.newPassword);
    this.gateway.server.emit('usuario:password:reset', { message: 'Senha redefinida com sucesso' });
    return result;
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const result = await this.usuariosService.changePassword(
      id,
      body.oldPassword,
      body.newPassword,
    );

    this.gateway.server.emit('usuario:password:changed', { id });
    return result;
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivateUser(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.deactivateUser(id);
    this.gateway.server.emit('usuario:deactivated', { id, usuario });
    return usuario;
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  async activateUser(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.activateUser(id);
    this.gateway.server.emit('usuario:activated', { id, usuario });
    return usuario;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.remove(id);
    this.gateway.server.emit('usuario:deleted', { id });

    return usuario;
  }
}