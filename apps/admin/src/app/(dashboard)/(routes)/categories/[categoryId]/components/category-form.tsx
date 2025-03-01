'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import ImageUpload from '@/components/ui/image-upload'
import { Banner, Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(2, 'Title must be at least 2 characters long'),
   description: z.string().min(1, 'Description is required'),
   imageUrl: z.string().optional(),
   bannerId: z.string().min(1, 'Banner is required'),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
   initialData: Category | null
   banners: Banner[]
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
   initialData,
   banners,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit category' : 'Create category'
   const description = initialData ? 'Edit a category.' : 'Add a new category'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<CategoryFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         title: '',
         description: '',
         imageUrl: '',
         bannerId: '',
      },
   })

   const onSubmit = async (data: CategoryFormValues) => {
      console.log('🚀 Submitting form with data:', data);
      console.log('🖼️ New Image URL:', data.imageUrl); // Debugging the image URL
   
      try {
         setLoading(true)
         const method = initialData ? 'PATCH' : 'POST'
         const url = initialData
            ? `/api/categories/${params.categoryId}`
            : `/api/categories`

         console.log(`📡 Sending ${method} request to ${url}...`)

         const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               title: data.title,
               description: data.description,
               imageUrl: data.imageUrl,
               bannerId: data.bannerId,
            }),
            cache: 'no-store',
         })

         const responseText = await response.text()
         console.log('📡 Raw Response Body:', responseText)

         let responseData
         try {
            responseData = JSON.parse(responseText)
         } catch (error) {
            console.error('❌ Response is not valid JSON:', responseText)
            throw new Error('Invalid JSON response from server')
         }

         if (!response.ok) {
            console.error('❌ API Error:', responseData)
            throw new Error(responseData.error || 'Failed to save category')
         }

         toast.success(initialData ? 'Category updated.' : 'Category created.')
         router.refresh()
         router.push('/categories')
      } catch (error: any) {
         console.error('❌ Error:', error)
         toast.error(error.message || 'Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         await fetch(`/api/categories/${params.categoryId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         router.refresh()
         router.push('/categories')
         toast.success('Category deleted.')
      } catch (error: any) {
         toast.error('Make sure you removed all products using this category first.')
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

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
               <div className="md:grid md:grid-cols-3 gap-8">
               <FormField
   control={form.control}
   name="imageUrl"
   render={({ field }) => (
      <FormItem>
         <FormLabel>Category Image</FormLabel>
         <FormControl>
            <ImageUpload
               value={field.value ? [field.value] : []}
               disabled={loading}
               onChange={(urls: string[]) => {
                  console.log("🖼️ Image selected:", urls[0]); // Debugging log
                  field.onChange(urls[0] || '');
               }}
               onRemove={() => {
                  console.log("🗑️ Image removed");
                  field.onChange('');
               }}
            />
         </FormControl>
         <FormMessage />
      </FormItem>
   )}
/>

                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Category name"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Description</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Enter description"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="bannerId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Banner</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select a banner" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {banners.map((banner) => (
                                    <SelectItem key={banner.id} value={banner.id}>
                                       {banner.label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
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
