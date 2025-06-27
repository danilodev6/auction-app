import Image from "next/image";
import Link from "next/link";
import SignOut from "@/components/Signout";
import SignIn from "@/components/Signin";
import { auth, isAdmin } from "@/auth";
import { FeaturedIndicator } from "@/components/FeaturedIndicator";

export async function Header() {
  const session = await auth();
  const userIsAdmin = await isAdmin(session);

  return (
    <header className="sticky top-0 z-50 bg-transparent pt-4 px-4">
      <div className="relative max-w-screen-2xl mx-auto flex items-center justify-between h-14">
        {/* Logo + Brand capsule */}
        <Link href="/">
          <div className="flex items-center gap-2 bg-primary text-accent px-9 h-14 rounded-md shadow">
            <Image
              src="/logotb.png"
              width={60}
              height={60}
              alt="Logo"
              priority
            />
            <div className="leading-tight font-semibold text-sm">
              <span className="block text-[15px]">T. Bogliacino</span>
              <span className="block text-sm">Subastas</span>
            </div>
          </div>
        </Link>

        {/* Navigation capsule (centered absolutely) */}
        <nav className="absolute left-1/2 -translate-x-1/2 bg-primary text-white px-9 h-14 rounded-md shadow flex items-center space-x-9 text-sm sm:text-base">
          <Link href="/" className="hover:text-accent hover-nav-link px-3 py-2">
            Home
          </Link>
          <div className="relative">
            <Link
              href="/live"
              className="hover:text-accent hover-nav-link px-3 py-2"
            >
              Live
            </Link>
            <FeaturedIndicator />
          </div>
          {userIsAdmin && (
            <>
              <Link
                href="/items/create"
                className="hover:text-accent hover-nav-link px-3 py-2"
              >
                Crear
              </Link>
              <Link
                href="/items/manage"
                className="hover:text-accent hover-nav-link px-3 py-2"
              >
                Items
              </Link>
              <Link
                href="/admin/users"
                className="hover:text-accent hover-nav-link px-3 py-2"
              >
                Users
              </Link>
            </>
          )}
        </nav>

        {/* User Info capsule */}
        <div className="flex items-center gap-3 bg-primary text-white px-9 h-14 rounded-md shadow">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          {session?.user?.name ? (
            <span>{session.user.name}</span>
          ) : (
            <span>Tu nombre</span>
          )}
          {session ? <SignOut /> : <SignIn />}
        </div>
      </div>
    </header>
  );
}
