import { signIn } from "@/auth";
import { Button } from "./ui/button";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button
        type="submit"
        className="m-2 bg-accent text-primary px-4 py-1 rounded hover:bg-secondary"
      >
        Iniciar sesión
      </Button>
    </form>
  );
}
