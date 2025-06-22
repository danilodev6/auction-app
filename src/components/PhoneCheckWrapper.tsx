"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PhoneCheckWrapperProps {
  children: React.ReactNode;
}

export default function PhoneCheckWrapper({
  children,
}: PhoneCheckWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPhoneNumber = async () => {
      // Skip check for certain paths
      const skipPaths = ["/complete-profile", "/api", "/auth"];
      if (skipPaths.some((path) => pathname.startsWith(path))) {
        setIsChecking(false);
        return;
      }

      // Wait for session to load
      if (status === "loading") {
        return;
      }

      // If user is not authenticated, let them continue
      if (status === "unauthenticated" || !session?.user?.email) {
        setIsChecking(false);
        return;
      }

      // Check if user has phone number
      try {
        const response = await fetch("/api/check-phone");
        const data = await response.json();

        if (data.needsPhone && pathname !== "/complete-profile") {
          router.push("/complete-profile");
          return;
        }

        if (!data.needsPhone && pathname === "/complete-profile") {
          router.push("/");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error checking phone status:", error);
        setIsChecking(false);
      }
    };

    checkPhoneNumber();
  }, [session, status, pathname, router]);

  // Show loading while checking
  if (isChecking && status !== "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div> */}
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-loading-bar w-1/2 rounded-full"></div>
          </div>

          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
