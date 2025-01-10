import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, BadRequestException, InternalServerErrorException, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Tipo_usuario } from '@prisma/client';
import { AuthRegisterDto } from '../../auth/dto/authRegisterDto.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Path } from 'glob';
import { Response } from 'express';
import { CambiarCorreoDto } from './dto/cambiarCorreo.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  public async registrarUsuario(@Body() usuario: AuthRegisterDto){
    return await this.usersService.signUp(usuario);
  }
  @Get(':id')
  public async obtenerUsuario(@Param('id') id: string) {
    return await this.usersService.obtenerUsuario(+id);
  }
  @Get('lista-rol/:rol')
  public async obtenerUsuariosByRol(@Param('rol') rol: string){
    if(rol === "SECRETARIA"){
      const rolSecretariaDep = Tipo_usuario[(rol+'_DEPARTAMENTO').toUpperCase() as keyof typeof Tipo_usuario];
      const rolSecretariaCar = Tipo_usuario[(rol+'_CARRERA').toUpperCase() as keyof typeof Tipo_usuario];
      
      return await this.usersService.obtenerSecretarias()
    }
    const rolUsuario = Tipo_usuario[rol.toUpperCase() as keyof typeof Tipo_usuario];

    if (!rolUsuario) {
      throw new Error('Rol inválido');
    }
    return await this.usersService.obtenerUsuariosByRol(rolUsuario);
  }

  @UseGuards(AuthGuard) // Protege la ruta con el AuthGuard
  @Patch('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const { id_usuario, rol } = req.user; // Extrae el ID y rol del usuario del token JWT
  

    if (rol === 'ADMINISTRADOR' || rol === 'JEFE_DEPARTAMENTO' || rol === 'JEFE_CARRERA' || rol==='SECRETARIA_DEPARTAMENTO' || rol === 'SECRETARIA_CARRERA') {
      // Si es administrador o jefe, cambia la contraseña en el servicio correspondiente
      return this.usersService.changeAdminPassword(id_usuario, changePasswordDto);
    }
  
    // Si es un usuario regular, cambia la contraseña en el servicio de usuarios
    return this.usersService.changePassword(id_usuario, changePasswordDto);
  }

  @UseGuards(AuthGuard)
  @Patch('cambiar-correo/administrador')
  async cambiarCorreoAdministradores(@Req() req: any, @Body() cambiarCorreoDto: CambiarCorreoDto){
    try {
      const { rol } = req.user;
      if(rol === 'ADMINISTRADOR'){
        return this.usersService.actualizarCorreoAdmin(cambiarCorreoDto.correoAnterior, cambiarCorreoDto.correoActual);
      }
      throw new UnauthorizedException('No está autorizado a realizar esta operación');
    } catch (error) {
      if(error instanceof UnauthorizedException || error instanceof BadRequestException){
        throw error;
      }
      throw new InternalServerErrorException('Error interno al cambiar el correo de los administradores');
    }
  }
  
  @UseGuards(AuthGuard)
  @Patch('reestablecer/contrasena')
  async reestablecerContrasena(
    @Req() res: any,
    @Query('id', ParseIntPipe) id_usuario: number,
    @Query('rol_usuario') rol_usuario: Tipo_usuario){
    try {
      const { rol } = res.user; 
      if(rol === 'ADMINISTRADOR'){
        return await this.usersService.reestablecerContrasena(id_usuario, rol_usuario);
      }
      throw new UnauthorizedException('No tiene permisos paraa ejecutar esta operación');
    } catch (error) {
      if(error instanceof BadRequestException || error instanceof UnauthorizedException){
        throw error;
      }
      throw new InternalServerErrorException('Error interno al actualizar la contrasena');
    }
  }

  @UseGuards(AuthGuard)
  @Get('administradores/obtener/lista')
  async obtenerListaAdministradores(@Req() res: any){
    try {
      const { rol } = res.user; 
      if(rol === 'ADMINISTRADOR'){
        return await this.usersService.obtenerAdministradores();
      }
      throw new UnauthorizedException('No tiene permisos paraa ejecutar esta operación');
    } catch (error) {
      if(error instanceof BadRequestException || error instanceof UnauthorizedException){
        throw error;
      }
      throw new InternalServerErrorException('Error interno al actualizar la contrasena');
    }
  }
}
