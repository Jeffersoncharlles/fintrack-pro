import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import type { AuthService } from './auth.service.ts'
import {
  AuthenticateDto,
  type AuthenticateDtoType,
} from './dtos/authenticate.dto.ts'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return access token' })
  async authenticate(
    @Body({ schema: AuthenticateDto }) body: AuthenticateDtoType,
  ) {
    // Implement your authentication logic here
    return  this.authService.authenticate(body)

  }
}
