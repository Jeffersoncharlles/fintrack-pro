import { Injectable, type NestMiddleware } from '@nestjs/common'

@Injectable()
export class MiddlewaresMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: () => void) {
    next()
  }
}
