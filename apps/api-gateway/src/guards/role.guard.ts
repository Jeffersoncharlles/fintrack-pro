import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common'
import type { Observable } from 'rxjs'

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(
    _context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true
  }
}
