import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  useOrganization,
  useUpdateOrganization,
  useUpdateOrganizationSettings,
  useUploadOrganizationLogo,
  type OrganizationSettings,
} from '@/hooks/use-organization'
import { Building2, Upload, Loader2 } from 'lucide-react'

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  timezone: z.string().optional(),
})

const settingsSchema = z.object({
  business_hours: z.object({
    start: z.string(),
    end: z.string(),
    lunch_start: z.string(),
    lunch_end: z.string(),
  }),
  scheduling: z.object({
    buffer_minutes: z.coerce.number().min(0).max(60),
    max_daily_hours: z.coerce.number().min(1).max(12),
    lead_days: z.coerce.number().min(1).max(90),
  }),
})

type OrganizationFormData = z.infer<typeof organizationSchema>
type SettingsFormData = z.infer<typeof settingsSchema>

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (no DST)' },
]

export default function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganization()
  const updateOrganization = useUpdateOrganization()
  const updateSettings = useUpdateOrganizationSettings()
  const uploadLogo = useUploadOrganizationLogo()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const orgForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip: '',
      timezone: 'America/New_York',
    },
  })

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_hours: {
        start: '08:00',
        end: '17:00',
        lunch_start: '12:00',
        lunch_end: '13:00',
      },
      scheduling: {
        buffer_minutes: 15,
        max_daily_hours: 8,
        lead_days: 14,
      },
    },
  })

  // Reset forms when organization loads
  useEffect(() => {
    if (organization) {
      orgForm.reset({
        name: organization.name || '',
        email: organization.email || '',
        phone: organization.phone || '',
        website: organization.website || '',
        address_line1: organization.address_line1 || '',
        address_line2: organization.address_line2 || '',
        city: organization.city || '',
        state: organization.state || '',
        zip: organization.zip || '',
        timezone: organization.timezone || 'America/New_York',
      })

      const settings = organization.settings as OrganizationSettings | null
      if (settings) {
        settingsForm.reset({
          business_hours: settings.business_hours || {
            start: '08:00',
            end: '17:00',
            lunch_start: '12:00',
            lunch_end: '13:00',
          },
          scheduling: settings.scheduling || {
            buffer_minutes: 15,
            max_daily_hours: 8,
            lead_days: 14,
          },
        })
      }
    }
  }, [organization, orgForm, settingsForm])

  const onOrgSubmit = async (data: OrganizationFormData) => {
    try {
      await updateOrganization.mutateAsync(data)
      toast({
        title: 'Organization updated',
        description: 'Your organization settings have been saved.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update organization settings.',
        variant: 'destructive',
      })
    }
  }

  const onSettingsSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings.mutateAsync(data)
      toast({
        title: 'Settings updated',
        description: 'Business hours and scheduling settings have been saved.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadLogo.mutateAsync(file)
      toast({
        title: 'Logo uploaded',
        description: 'Your organization logo has been updated.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to upload logo.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <PageHeader
        title="Organization Settings"
        description="Manage your company information and business settings"
      />

      <div className="space-y-6 mt-6">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>
              Upload your company logo to display on reports and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={organization?.logo_url || undefined} />
                <AvatarFallback>
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogo.isPending}
                >
                  {uploadLogo.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended: Square image, at least 200x200 pixels
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your organization's contact details and address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...orgForm}>
              <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={orgForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Home Care" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={orgForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={orgForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={orgForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Address</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={orgForm.control}
                      name="address_line1"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="address_line2"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Suite 100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Miami" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={orgForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="FL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={orgForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="33101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={orgForm.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="max-w-sm">
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateOrganization.isPending || !orgForm.formState.isDirty}
                >
                  {updateOrganization.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Business Hours & Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours & Scheduling</CardTitle>
            <CardDescription>
              Configure your operating hours and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Business Hours</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={settingsForm.control}
                      name="business_hours.start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="business_hours.end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="business_hours.lunch_start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lunch Start</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="business_hours.lunch_end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lunch End</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Scheduling Preferences</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={settingsForm.control}
                      name="scheduling.buffer_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buffer Between Inspections</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={60} {...field} />
                          </FormControl>
                          <FormDescription>Minutes between inspections</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="scheduling.max_daily_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Daily Hours</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={12} {...field} />
                          </FormControl>
                          <FormDescription>Per inspector per day</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="scheduling.lead_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduling Lead Time</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={90} {...field} />
                          </FormControl>
                          <FormDescription>Days in advance to schedule</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateSettings.isPending || !settingsForm.formState.isDirty}
                >
                  {updateSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
