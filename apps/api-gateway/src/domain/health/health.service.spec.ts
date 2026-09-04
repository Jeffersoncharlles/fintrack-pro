import { HealthService } from './health.service.js'

describe('HealthService', () => {
  it('returns an operational status', () => {
    expect(new HealthService().getHealth()).toEqual({ status: 'ok' })
  })
})
