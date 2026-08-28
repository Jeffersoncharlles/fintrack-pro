import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppRouter } from './app-router'
import { TooltipProvider } from './components/ui/tooltip'
import { AuthProvider } from './contexts/auth-context'
import { queryClient } from './lib/react-query'

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
