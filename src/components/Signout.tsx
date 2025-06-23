import { signOut } from "@/auth";
import { Button } from "./ui/button";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirectTo: "/",
        });
      }}
    >
      <Button
        className="m-2 bg-accent text-primary px-4 py-1 rounded hover:bg-secondary"
        type="submit"
      >
        Cerrar sesión
      </Button>
    </form>
  );
}
