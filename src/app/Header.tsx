import Image from "next/image";
import SignOut from "@/components/Signout";
import { auth, isAdmin } from "@/auth";
import Link from "next/link";
import SignIn from "@/components/Signin";

export async function Header() {
  const session = await auth();
  const userIsAdmin = await isAdmin(session);

  return (
    <div className="bg-primary text-white py-2 sticky top-0 z-50">
      <div className="container flex items-center gap-5">
        <div className="flex items-center gap-2 p-1">
          <Image src="/logotb2.png" width="75" height="75" alt="logo" />
          <p className="text-accent bold text-sm/4.5 mr-8">
            Teresita
            <br />
            Bogliacino <br />
            Subastas
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-accent hover-underline"
          >
            Home
          </Link>
        </div>

        <div>
          <Link
            href="/live"
            className="flex items-center gap-1 hover:text-accent hover-underline"
          >
            Live
          </Link>
        </div>

        <div>
          {userIsAdmin && (
            <Link
              href="/items/create"
              className="flex items-center gap-1 hover:text-accent hover-underline"
            >
              Create Item
            </Link>
          )}
        </div>

        <div>
          {userIsAdmin && (
            <Link
              href="/items/manage"
              className="flex items-center gap-1 hover:text-accent hover-underline"
            >
              Manage Items
            </Link>
          )}
        </div>

        <div className="ml-auto">
          <Link
            href="/terms"
            className="flex items-center gap-1 hover:text-accent hover-underline"
          >
            Términos y condiciones
          </Link>
        </div>

        <div className="flex items-center gap-4">
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
          {session ? (
            <SignOut />
          ) : (
            <div className="flex items-center gap-2">
              <SignIn />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
