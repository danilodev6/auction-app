import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-primary text-white px-4 sm:px-6 lg:px-9 min-h-[3.5rem] py-3 rounded-md shadow-lg w-[calc(100vw-2rem)] max-w-screen-md animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-6">
        <p className="text-sm sm:text-base whitespace-nowrap">
          tbsubastas@gmail.com
        </p>
        <p className="text-sm sm:text-base whitespace-nowrap">+3446 66 33 76</p>
        <div className="text-sm sm:text-base">
          <Link href="/terms" className="hover-nav-link whitespace-nowrap">
            Términos y condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
}
