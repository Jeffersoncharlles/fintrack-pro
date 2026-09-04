import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import {
  AuthenticateDto,
  type AuthenticateDtoType,
  AuthResponseSchema,
  type CreateUserBody,
  CreateUserBodySchema,
} from './dtos/authenticate.dto.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
    standardSchema: AuthResponseSchema,
  })
  async authenticate(
    @Body({ schema: AuthenticateDto }) body: AuthenticateDtoType,
  ) {
    return await this.authService.authenticate(body)
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    standardSchema: AuthResponseSchema,
  })
  async register(@Body({ schema: CreateUserBodySchema }) body: CreateUserBody) {
    return await this.authService.register(body)
  }
}
