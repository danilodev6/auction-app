import Image from "next/image";
import SignIn from "@/components/Signin";
import SignOut from "@/components/Signout";
import { auth } from "@/auth";
import Link from "next/link";

export async function Header() {
  const session = await auth();

  return (
    <div className="bg-gray-200 py-2 sticky top-0">
      <div className="container flex items-center gap-10">
        <div className="flex items-center gap-4 justify-self-end">
          <Link href="/" className="flex items-center gap-1">
            <Image src="/logo.png" width="60" height="60" alt="logo" />
            Auction App
          </Link>
        </div>
        <div>
          <Link href="/items/create" className="flex items-center gap-1">
            Create Item
          </Link>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {session?.user?.image && (
            <Image
              src={session?.user?.image}
              width="40"
              height="40"
              alt="user avatar"
              className="rounded-full"
            />
          )}
          {session?.user?.name}
          {session ? <SignOut /> : <SignIn />}
        </div>
      </div>
    </div>
  );
}
