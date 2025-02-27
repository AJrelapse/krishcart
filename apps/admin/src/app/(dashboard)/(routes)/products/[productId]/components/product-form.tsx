'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { ProductWithIncludes, Category, Brand } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(1),
   description: z.string().min(1),
   images: z.string().array(),
   price: z.coerce.number().min(1),
   discount: z.coerce.number().min(0),
   stock: z.coerce.number().min(0),
   categoryId: z.string().min(1),
   brandId: z.string().min(1),
   isFeatured: z.boolean().default(false).optional(),
   isAvailable: z.boolean().default(false).optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
   initialData: ProductWithIncludes | null
   categories: Category[]
}

export const ProductForm: React.FC<ProductFormProps> = ({
   initialData,
   categories,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)
   const [brands, setBrands] = useState<Brand[]>([])

   useEffect(() => {
      async function fetchBrands() {
         try {
            const response = await fetch('/api/brands')
            if (response.ok) {
               const data = await response.json()
               setBrands(data)
            }
         } catch (error) {
            console.error('Failed to fetch brands', error)
         }
      }
      fetchBrands()
   }, [])

   const title = initialData ? 'Edit product' : 'Create product'
   const description = initialData ? 'Edit a product.' : 'Add a new product'
   const toastMessage = initialData ? 'Product updated.' : 'Product created.'
   const action = initialData ? 'Save changes' : 'Create'

   const defaultValues = initialData
      ? {
           ...initialData,
           price: parseFloat(String(initialData?.price.toFixed(2))),
           discount: parseFloat(String(initialData?.discount.toFixed(2))),
        }
      : {
           title: '---',
           description: '---',
           images: [] as string[],
           price: 0,
           discount: 0,
           stock: 0,
           categoryId: '---',
           brandId: '---',
           isFeatured: false,
           isAvailable: false,
        }

   const form = useForm<ProductFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: ProductFormValues) => {
      const formattedData = {
         ...data,
         price: Number(data.price),
         discount: Number(data.discount),
         stock: Number(data.stock),
         images: data.images.map((img) =>
            typeof img === 'string' ? img : (img as { url: string }).url
         ),
               };
   
      try {
         setLoading(true);
   
         const response = await fetch(initialData ? `/api/products/${params.productId}` : `/api/products`, {
            method: initialData ? 'PATCH' : 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData),
            cache: 'no-store',
         });
   
         if (!response.ok) throw new Error('Failed to save product');
   
         router.refresh();
         router.push(`/products`);
         toast.success(toastMessage);
      } catch (error) {
         toast.error('Something went wrong.');
      } finally {
         setLoading(false);
      }
   };
   
   
   
   
   

   const onDelete = async () => {
      try {
         setLoading(true)

         await fetch(`/api/products/${params.productId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })

         router.refresh()
         router.push(`/products`)
         toast.success('Product deleted.')
      } catch (error: any) {
         toast.error('Something went wrong.')
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
<FormField
   control={form.control}
   name="images"
   render={({ field }) => (
      <FormItem>
         <FormLabel>Images</FormLabel>
         <FormControl>
            <ImageUpload
               value={field.value || []} // Ensure it's an array
               disabled={loading}
               onChange={(urls: string[]) => field.onChange([...field.value, ...urls])} // Append new images
               onRemove={(url: string) =>
                  field.onChange(field.value.filter((img) => img !== url))
               } // Remove selected image
            />
         </FormControl>
         <FormMessage />
      </FormItem>
   )}
/>




               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Product title"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="price"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Price</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="9.99"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

<FormField control={form.control} name="brandId" render={({ field }) => (
                  <FormItem>
                     <FormLabel>Brand</FormLabel>
                     <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                              <SelectValue defaultValue={field.value} placeholder="Select a brand" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                 {brand.title}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormMessage />
                  </FormItem>
               )} />


                  <FormField
                     control={form.control}
                     name="discount"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Discount</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="9.99"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="stock"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Stock</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="categoryId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Category</FormLabel>
                           <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue
                                       defaultValue={field.value}
                                       placeholder="Select a category"
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {categories.map((category) => (
                                    <SelectItem
                                       key={category.id}
                                       value={category.id}
                                    >
                                       {category.title}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
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
               placeholder="Enter product description"
               {...field}
            />
         </FormControl>
         <FormMessage />
      </FormItem>
   )}
/>

                  <FormField
                     control={form.control}
                     name="isFeatured"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                              <FormDescription>
                                 This product will appear on the home page
                              </FormDescription>
                           </div>
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="isAvailable"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Available</FormLabel>
                              <FormDescription>
                                 This product will appear in the store.
                              </FormDescription>
                           </div>
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit" onSubmit={form.handleSubmit(onSubmit)}>
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
