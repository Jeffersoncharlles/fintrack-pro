import type { HelmetOptions } from 'helmet'

export const HelmetConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], //fonte padrão de onde os recursos podem ser carregados
      scriptSrc: ["'self'", "'unsafe-inline'"], //fonte de css inline
      styleSrc: ["'self'", "'unsafe-inline'"], //fonte de css
      imgSrc: ["'self'", 'data:', 'https:'], //fonte de imagens
    },
  },
  crossOriginEmbedderPolicy: false, // desabilitar a política de segurança de recursos incorporados
  hsts: {
    maxAge: 31536000, // 1 ano em segundos forcar o uso de HTTPS
    includeSubDomains: true, // aplicar a política a todos os subdomínios
    preload: true, // permitir que o site seja incluído na lista de pré-carregamento do HSTS
  },
}
