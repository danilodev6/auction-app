"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, pageSize }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Convert existing search params to a plain object
  const params = new URLSearchParams(searchParams.toString());

  return (
    <div className="flex justify-center mt-4">
      <nav className="flex items-center">
        <Link
          href={{
            pathname,
            query: {
              ...Object.fromEntries(params),
              page: currentPage - 1,
              pageSize,
            },
          }}
        >
          <Button disabled={currentPage <= 1}>Previous</Button>
        </Link>
        <Link
          href={{
            pathname,
            query: {
              ...Object.fromEntries(params),
              page: currentPage + 1,
              pageSize,
            },
          }}
        >
          <Button className="mx-3">Next</Button>
        </Link>
      </nav>
    </div>
  );
};

export default Pagination;
