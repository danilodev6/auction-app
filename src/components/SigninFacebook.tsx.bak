import { signIn } from "@/auth";
import { Button } from "./ui/button";

export default function SigninFacebook() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("facebook");
      }}
    >
      <Button type="submit">Sign in with Facebook</Button>
    </form>
  );
}
