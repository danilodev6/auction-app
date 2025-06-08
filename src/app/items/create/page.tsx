import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import CreateItemForm from "./CreateItemForm";

export default async function CreatePage() {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Post an item</h1>
      <CreateItemForm />
    </main>
  );
}
