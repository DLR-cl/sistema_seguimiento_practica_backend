import { Body, Controller,Post } from '@nestjs/common';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}

    @Post('register')
    register(@Body() user: AuthRegisterDto){
        return this.authService.signUp(user);
    }
    
    @Post('login')
    login(@Body() user_login: AuthLoginDto){
        return this.authService.loginUser(user_login);
    }
}
