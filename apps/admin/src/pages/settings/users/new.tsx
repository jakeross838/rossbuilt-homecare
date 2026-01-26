import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { UserForm } from './components/user-form'
import { useCreateUser } from '@/hooks/use-users'
import { toast } from '@/hooks/use-toast'
import {
  type CreateUserFormData,
  transformCreateUserData,
} from '@/lib/validations/user'

export function NewUserPage() {
  const navigate = useNavigate()
  const createUser = useCreateUser()

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      const transformedData = transformCreateUserData(data)
      const result = await createUser.mutateAsync(transformedData)

      toast({
        title: 'User created',
        description: `${data.first_name} ${data.last_name} has been created successfully.`,
      })

      navigate(`/settings/users/${result.user_id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    navigate('/settings/users')
  }

  return (
    <div>
      <PageHeader
        title="New User"
        description="Create a new user account"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </PageHeader>

      <div className="mt-6">
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createUser.isPending}
          submitLabel="Create User"
        />
      </div>
    </div>
  )
}

export default NewUserPage
