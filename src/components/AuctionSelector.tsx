"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Item = {
  id: number;
  name: string;
};

export default function AuctionSelector({ items }: { items: Item[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("item") || String(items[0].id);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    router.push(`/live?item=${newId}`);
  };

  return (
    <select
      value={selectedId}
      onChange={handleSelectChange}
      className="p-2 border rounded w-full"
    >
      {items.map((item) => (
        <option key={item.id} value={String(item.id)}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
