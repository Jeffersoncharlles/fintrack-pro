import { createFileRoute } from '@tanstack/react-router'
import { PixTransferPage } from '@/pages/pix-transfere'

export const Route = createFileRoute('/_private/pix-tranfere')({
  component: PixTransferPage,
})
