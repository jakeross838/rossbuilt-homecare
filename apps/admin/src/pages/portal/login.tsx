import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

export default function PortalLoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const signIn = useAuthStore((state) => state.signIn)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Check if user is a client
      const profile = useAuthStore.getState().profile
      if (profile?.role !== 'client') {
        toast({
          title: 'Access denied',
          description: 'This portal is for clients only. Please use the admin login.',
          variant: 'destructive',
        })
        await useAuthStore.getState().signOut()
        setIsLoading(false)
        return
      }

      navigate('/portal')
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ross Built</CardTitle>
          <CardDescription>Client Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Not a client?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Admin login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
