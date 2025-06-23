import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed flex items-center bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-9 h-14 py-3 rounded-md shadow-lg z-50">
      <div className="flex flex-col sm:flex-row items-center space-x-3.5 gap-2 sm:gap-6">
        <p>info@tuapp.com </p>
        <p>+54 11 1234 5678 </p>
        <div>
          <Link href="/terms" className="hover-nav-link">
            Términos y condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
}
