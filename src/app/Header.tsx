import Image from "next/image";
import Link from "next/link";
import SignOut from "@/components/Signout";
import SignIn from "@/components/Signin";
import { auth, isAdmin } from "@/auth";
import { FeaturedIndicator } from "@/components/FeaturedIndicator";
import { NavigationWrapper } from "@/components/NavigationWrapper";

export async function Header() {
  const session = await auth();
  const userIsAdmin = await isAdmin(session);

  return (
    <header className="sticky top-0 z-50 bg-transparent pt-4 px-4 <animate-fade-in-down delay-100">
      <div className="relative max-w-screen-2xl mx-auto flex items-center justify-between h-14">
        {/* Logo + Brand capsule */}
        <Link href="/" className="absolute left-0">
          <div className="flex items-center gap-2 bg-primary text-accent px-4 sm:px-9 h-14 rounded-md shadow">
            <Image
              src="/logotb.png"
              width={40}
              height={40}
              alt="Logo"
              priority
              className="sm:w-[60px] sm:h-[60px]"
            />
            <div className="leading-tight font-semibold text-sm hidden sm:block">
              <Image
                src="/namelogo.png"
                alt="name logo"
                width={110}
                height={60}
              />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation with FeaturedIndicator - show at 1278px+ (xl breakpoint) */}
        <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 bg-primary text-white px-9 h-14 rounded-md shadow items-center space-x-9 lg:text-base">
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

        {/* Right side - Mobile hamburger + User info */}
        <div className="flex items-center gap-3 absolute right-0">
          {/* Mobile Navigation (hamburger button and mobile menu) - show below 1278px */}
          <NavigationWrapper userIsAdmin={userIsAdmin} />

          {/* User Info capsule */}
          <div className="flex items-center gap-2 sm:gap-3 bg-primary text-white px-3 sm:px-9 h-14 rounded-md shadow">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full sm:w-9 sm:h-9"
              />
            )}
            {/* Username visible at 1278px+ (xl breakpoint and above) */}
            <span className="hidden xl:block">
              {session?.user?.name || "Tu nombre"}
            </span>
            {session ? <SignOut /> : <SignIn />}
          </div>
        </div>
      </div>
    </header>
  );
}
