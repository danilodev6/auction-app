import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminOnly({
  children,
  fallback = null,
}: AdminOnlyProps) {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (session) {
        const response = await fetch("/api/auth/check-admin");
        const { admin } = await response.json();
        setIsAdmin(admin);
      }
    }
    checkAdmin();
  }, [session]);

  return isAdmin ? children : fallback;
}
