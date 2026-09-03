import { Injectable } from '@nestjs/common'
import type { AuthenticateDtoType } from './dtos/authenticate.dto.ts'

@Injectable()
export class AuthService {
  async authenticate(payload: AuthenticateDtoType) {}
}
