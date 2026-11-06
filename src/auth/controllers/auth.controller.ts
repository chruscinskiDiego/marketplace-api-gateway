import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    
    constructor( private readonly authService: AuthService){ }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User Login'})
    @ApiResponse({ status: 200, description: 'User logged in successfully'})
    @ApiResponse({ status: 401, description: 'Invalid credentials'})
    @Public()
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    async login(@Body() loginDto: LoginDto) {

        return this.authService.login(loginDto);

    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User Registration'})
    @ApiResponse({ status: 201, description: 'User registered successfully'})
    @ApiResponse({ status: 400, description: 'Invalid registration data'})
    @Throttle({ medium: { limit: 3, ttl: 60000 } }) // {} se não quiser sobrescrever o limite global, mas se quiser sobrescrever, pode passar { limit: 5, ttl: 60000 }
    async register(@Body() registerDto: RegisterDto){

        return this.authService.register(registerDto);

    }
}
