import { auth } from "@/auth";
import Image from "next/image";

export default async function BlockedPage() {
  const session = await auth();

  return (
    <main className="container mx-auto">
      <div className="max-w-md w-full bg-white rounded-md mx-auto lg:mt-24 shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 items-center justify-center mb-4">
            <Image src="/blocked.svg" alt="blocked" width={64} height={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Blocked
          </h1>
          <p className="text-gray-600">
            Your account has been temporarily blocked by an administrator.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Account:</strong> {session?.user?.email}
          </p>
          <p className="text-sm text-red-700 mt-2">
            If you believe this is an error, please contact support.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-gray-500">
          If you need immediate assistance, please email support@yoursite.com
        </div>
      </div>
    </main>
  );
}
