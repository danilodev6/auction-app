"use client";

import dynamic from "next/dynamic";

// Dynamically import the client component
const NavigationWrapper = dynamic(
  () =>
    import("@/components/NavigationWrapper").then((mod) => ({
      default: mod.NavigationWrapper,
    })),
  {
    ssr: false,
  },
);

interface HeaderClientProps {
  userIsAdmin: boolean;
}

export function HeaderClient({ userIsAdmin }: HeaderClientProps) {
  return <NavigationWrapper userIsAdmin={userIsAdmin} />;
}
