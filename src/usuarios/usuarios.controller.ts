import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtAuthGuard } from '@/jwt-guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.usuariosService.login(loginUsuarioDto);
  }

  @Post('create')
  // @UseGuards(JwtAuthGuard)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('estatisticas')
  @UseGuards(JwtAuthGuard)
  getEstatisticas() {
    return this.usuariosService.getEstatisticas();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.usuariosService.findOne(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Get('username/:username')
  @UseGuards(JwtAuthGuard)
  findByUsername(@Param('username') username: string) {
    return this.usuariosService.findByUsername(username);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    return this.usuariosService.changePassword(id, body.oldPassword, body.newPassword);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  deactivateUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  activateUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.activateUser(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}