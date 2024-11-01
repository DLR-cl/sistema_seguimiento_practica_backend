import { Body, Controller,HttpCode,HttpStatus,Post } from '@nestjs/common';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}
    
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() userLogin: AuthLoginDto){
        return this.authService.signIn(userLogin);
    }
}
