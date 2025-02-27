'use client'

import * as z from 'zod'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Trash } from 'lucide-react'
import { Banner } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { AlertModal } from '@/components/modals/alert-modal'
import ImageUpload from '@/components/ui/image-upload'

// Define that the banner must have a label and a single image URL.
const formSchema = z.object({
   label: z.string().min(1),
   image: z.string().min(1),
})

type BannerFormValues = z.infer<typeof formSchema>

interface BannerFormProps {
   initialData: Banner | null
}

export const BannerForm: React.FC<BannerFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit banner' : 'Create banner'
   const description = initialData ? 'Edit a banner.' : 'Add a new banner'
   const toastMessage = initialData ? 'Banner updated.' : 'Banner created.'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<BannerFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         label: '',
         image: '',
      },
   })

   const onSubmit = async (data: BannerFormValues) => {
      try {
         setLoading(true);
         
         const bannerId = params.id || initialData?.id; // Ensure ID is fetched correctly
         if (initialData && bannerId) {
            await fetch(`/api/banners/${bannerId}`, {
               method: 'PATCH',
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(data),
               cache: 'no-store',
            });
         } else {
            await fetch(`/api/banners`, {
               method: 'POST',
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(data),
               cache: 'no-store',
            });
         }
   
         router.refresh();
         router.push(`/banners`);
         toast.success(toastMessage);
      } catch (error) {
         toast.error('Something went wrong.');
      } finally {
         setLoading(false);
      }
   };
   
   
   
   const onDelete = async () => {
      try {
         setLoading(true);
   
         const bannerId = params.id || initialData?.id; // Ensure ID is correctly retrieved
         if (!bannerId) {
            toast.error("Invalid banner ID.");
            return;
         }
   
         await fetch(`/api/banners/${bannerId}`, {
            method: 'DELETE',
            cache: 'no-store',
         });
   
         router.refresh();
         router.push(`/banners`);
         toast.success('Banner deleted.');
      } catch (error) {
         toast.error('Make sure you removed all categories using this banner first.');
      } finally {
         setLoading(false);
         setOpen(false);
      }
   };
   
   console.log("Initial Data:", initialData);  // Debugging

   

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            {initialData && (
               <Button
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  onClick={() => setOpen(true)}
               >
                  <Trash className="h-4" />
               </Button>
            )}
         </div>
         <Separator />
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-8 w-full"
            >
               <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Background image</FormLabel>
                        <FormControl>
                           <ImageUpload
                              // Pass the current image URL (if any) as an array
                              value={field.value ? [field.value] : []}
                              disabled={loading}
                              // When the uploader returns an array of URLs, pick the first one.
                              onChange={(urls: string[]) => {
                                 field.onChange(urls[0] || '')
                              }}
                              onRemove={() => field.onChange('')}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="label"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Label</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Banner label"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
