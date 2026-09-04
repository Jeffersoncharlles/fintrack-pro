import { HttpService } from '@nestjs/axios'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { serviceConfig } from '#src/config/gateway.config.js'
import { firstValueFrom } from 'rxjs'
import type {
  AuthenticateDtoType,
  CreateUserBody,
  UserSession,
} from './dtos/authenticate.dto.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}
  async authenticate(payload: AuthenticateDtoType) {}

  async validateJwtToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token)
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
  async validateSessionToken(token: string): Promise<UserSession> {
    try {
      const data = await firstValueFrom(
        this.httpService.get<UserSession>(
          `${serviceConfig.users.url}/auth/validate-session/${token}`,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      )
      return data.data
    } catch (error) {
      throw new UnauthorizedException('Invalid session token')
    }
  }

  async register(payload: CreateUserBody): Promise<UserSession> {
    try {
      const data = await firstValueFrom(
        this.httpService.post(
          `${serviceConfig.users.url}/auth/register`,
          payload,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      )
      return data.data
    } catch (error) {
      throw new UnauthorizedException('Failed to register user')
    }
  }
}
