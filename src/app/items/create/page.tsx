"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateItemAction } from "./actions";
import { useState } from "react";
import Image from "next/image";

export default function CreatePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Post an item</h1>
      <form
        className="border p-4 my-4 rounded-md space-y-4 max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            await CreateItemAction(formData);

            // Reset form
            form.reset();
            setImagePreview(null);

            // Optionally redirect or show success message
          } catch (error) {
            console.error("Error creating item:", error);
            // Show error message
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Item Name
          </label>
          <Input
            id="name"
            required
            className="mt-1"
            name="name"
            type="text"
            placeholder="Name your item"
          />
        </div>

        <div>
          <label
            htmlFor="startingPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Starting Price ($)
          </label>
          <Input
            id="startingPrice"
            required
            className="mt-1"
            name="startingPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Starting Price of your item"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Item Photo
          </label>
          <Input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            className="mt-1"
            onChange={handleFileChange}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative w-full h-64 mt-2 border rounded-md overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Item"}
        </Button>
      </form>
    </main>
  );
}

//
//           const form = e.currentTarget as HTMLFormElement;
//           const formData = new FormData(form);
//
//           await CreateItemAction(formData);
//         }}
//       >
//         <Input
//           required
//           className="max-w-lg"
//           name="name"
//           type="text"
//           placeholder="Name your item"
//         />
//         <Input
//           required
//           className="max-w-lg"
//           name="startingPrice"
//           type="number"
//           step="0.01"
//           min="0"
//           placeholder="Starting Price of your item"
//         />
//         <Input
//           type="file"
//           name="file"
//           className="max-w-lg"
//           placeholder="Insert the photo of your item"
//         ></Input>
//         <Button className="self-end" type="submit">
//           Post item
//         </Button>
//       </form>
//     </main>
//   );
// }
//
