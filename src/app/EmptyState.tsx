import Image from "next/image";

export function EmptyState() {
  return (
    <div className="container flex flex-col items-center mx-auto py-12">
      <h2 className="text-2xl font-bold text-center">Not items found</h2>
      <Image
        src="/package.svg"
        alt="Empty State"
        width={500}
        height={500}
        className="mt-8 mx-auto"
      />
    </div>
  );
}
