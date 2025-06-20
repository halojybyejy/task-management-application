import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { login, createOrFetchUser, getUserProjects, getAllUsers } from '../utils/supabaseClient';

@Controller('auth')
export class AuthController {
    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        try {
            console.log('AuthController login:', body);
            const { email, password } = body;
            
            if (!email || !password) {
                throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
            }
            
            const user = await login(email, password);

            console.log('AuthController login user:', user);
            return user;
        } catch (error) {
            console.error('Login endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Login failed',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @Post('register')
    async register(@Body() body: { email: string; password: string }) {
        try {
            console.log('AuthController register:', body);
            const { email, password } = body;

            if (!email || !password) {
                throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
            }

            const user = await createOrFetchUser(email, password);

            console.log('AuthController register user:', user);
            return user;
        } catch (error) {
            console.error('Register endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Register failed',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('all-users')
    async getAllUsers(@Body() body: { email: string; password: string }) {
        try {
            console.log('AuthController getAllUsers:', body);
            const users = await getAllUsers();
            console.log('AuthController getAllUsers result:', users);
            return users;
        } catch (error) {
            console.error('Get all users endpoint error:', error);
            throw new HttpException(
                error instanceof Error ? error.message : 'Failed to get all users',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        
    }

} 