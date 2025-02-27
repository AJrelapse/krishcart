'use client'

import { Button } from '@/components/ui/button'
import { ImagePlus, Trash } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ImageUploadProps {
   disabled?: boolean
   onChange: (value: string[]) => void
   onRemove: (value: string) => void
   value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
   disabled,
   onChange,
   onRemove,
   value,
}) => {
   const [isMounted, setIsMounted] = useState(false)

   useEffect(() => {
      setIsMounted(true)
   }, [])

   const onUpload = (result: any) => {
      if (result.event === 'success' && result.info?.secure_url) {
         const uploadedUrl = result.info.secure_url
         console.log("✅ Uploaded Image URL:", uploadedUrl)
   
         // Pass the new array to onChange
         onChange([...value, uploadedUrl])
      } else {
         console.error("❌ Upload failed:", result)
      }
   }
   

   if (!isMounted) return null

   return (
      <div>
         {/* Uploaded Images Display */}
         <div className="mb-4 flex flex-wrap gap-4">
            {value.map((url) => (
               <div
                  key={url}
                  className="relative w-[200px] h-[200px] rounded-md overflow-hidden border"
               >
                  {/* Delete Button */}
                  <div className="absolute top-2 right-2 z-10">
                     <Button
                        type="button"
                        onClick={() => onRemove(url)}
                        variant="destructive"
                        size="sm"
                     >
                        <Trash className="h-4" />
                     </Button>
                  </div>

                  {/* Render Image */}
                  <Image
                     src={url}
                     alt="Uploaded Image"
                     fill
                     className="object-cover rounded-md"
                     sizes="(min-width: 1000px) 30vw, 50vw"
                     unoptimized  // Prevent Next.js optimization issues
                  />
               </div>
            ))}
         </div>

         {/* Upload Button */}
         <CldUploadWidget uploadPreset="my_preset" onSuccess={onUpload}>
            {({ open }) => (
               <Button
                  type="button"
                  disabled={disabled}
                  variant="secondary"
                  onClick={() => open()}
                  className="flex gap-2"
               >
                  <ImagePlus className="h-4" />
                  <p>Upload an Image</p>
               </Button>
            )}
         </CldUploadWidget>
      </div>
   )
}

export default ImageUpload
