"use client";

import { ItemCard } from "@/components/ItemCard";
import { Item } from "@/db/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "motion/react";

interface ItemCarouselProps {
  items: Item[];
}

export function ItemCarousel({ items }: ItemCarouselProps) {
  // If 4 or fewer items, show them centered without carousel
  if (items.length <= 4) {
    return (
      <div className="w-full flex justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.8,
              },
            },
          }}
          className="flex flex-wrap justify-center gap-4 max-w-6xl px-4"
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    );
  }

  // If more than 4 items, use carousel with responsive behavior
  return (
    <div className="w-full px-4">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-4xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex-shrink-0"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.8,
                    },
                  },
                }}
                className="flex justify-center"
              >
                <ItemCard item={item} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}

// "use client";
//
// import { ItemCard } from "@/components/ItemCard";
// import { Item } from "@/db/schema";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
//
// interface ItemCarouselProps {
//   items: Item[];
// }
//
// export function ItemCarousel({ items }: ItemCarouselProps) {
//   // If 4 or fewer items, show them centered without carousel
//   if (items.length <= 4) {
//     return (
//       <div className="w-full flex justify-center">
//         <div className="flex flex-wrap justify-center gap-4 max-w-6xl px-4">
//           {items.map((item) => (
//             <ItemCard key={item.id} item={item} />
//           ))}
//         </div>
//       </div>
//     );
//   }
//
//   // If more than 4 items, use carousel
//   return (
//     <div className="w-full px-4">
//       <Carousel
//         opts={{
//           align: "start",
//           slidesToScroll: 4,
//         }}
//         className="w-full max-w-4xl mx-auto"
//       >
//         <CarouselContent className="-ml-4">
//           {items.map((item) => (
//             <CarouselItem
//               key={item.id}
//               className="pl-4 basis-1/4 flex-shrink-0"
//             >
//               <div className="flex justify-center">
//                 <ItemCard item={item} />
//               </div>
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//
//         <CarouselPrevious className="left-2" />
//         <CarouselNext className="right-2" />
//       </Carousel>
//     </div>
//   );
// }
