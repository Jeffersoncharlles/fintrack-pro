import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'

const authenticateFormDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type AuthenticateFormDataSchema = z.infer<
  typeof authenticateFormDataSchema
>

export function AuthenticatePage() {
  const { signIn, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<AuthenticateFormDataSchema>({
    resolver: zodResolver(authenticateFormDataSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  const handleFormSubmit = async (data: AuthenticateFormDataSchema) => {
    const result = await signIn(data)
    if (!result.success) {
      toast.error(result.error || 'Failed to authenticate')
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Authenticate</CardTitle>
          <CardDescription>
            To authenticate, please use your email and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
                <Input
                  id="fieldgroup-email"
                  type="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
                <Input
                  id="fieldgroup-password"
                  type="password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field orientation="horizontal">
                <Button
                  className="cursor-pointer"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Autenticando...' : 'Entrar'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
