import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    
    constructor( private readonly authService: AuthService){ }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User Login'})
    @ApiResponse({ status: 200, description: 'User logged in successfully'})
    @ApiResponse({ status: 401, description: 'Invalid credentials'})
    async login(@Body() loginDto: any) {

        return this.authService.login(loginDto);

    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User Registration'})
    @ApiResponse({ status: 201, description: 'User registered successfully'})
    @ApiResponse({ status: 400, description: 'Invalid registration data'})
    async register(@Body() registerDto: any){

        return this.authService.register(registerDto);

    }
}
