import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notification-preferences'
import { useToast } from '@/hooks/use-toast'
import type { Resolver } from 'react-hook-form'

const preferencesSchema = z.object({
  email: z.boolean(),
  inspection_reminders: z.boolean(),
  work_order_updates: z.boolean(),
  payment_alerts: z.boolean(),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

export function NotificationPreferences() {
  const { toast } = useToast()
  const { data: preferences, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema) as Resolver<PreferencesFormData>,
    values: preferences ? {
      email: preferences.email,
      inspection_reminders: preferences.inspection_reminders,
      work_order_updates: preferences.work_order_updates,
      payment_alerts: preferences.payment_alerts,
    } : undefined,
  })

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      await updatePreferences.mutateAsync(data)
      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Control which email notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspection_reminders"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Inspection Reminders
                    </FormLabel>
                    <FormDescription>
                      Get notified about upcoming inspections
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_order_updates"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Work Order Updates
                    </FormLabel>
                    <FormDescription>
                      Receive updates when work orders change status
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_alerts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Payment Alerts
                    </FormLabel>
                    <FormDescription>
                      Get notified about invoices and payments
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updatePreferences.isPending}>
            {updatePreferences.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Preferences
          </Button>
        </div>
      </form>
    </Form>
  )
}
