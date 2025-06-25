import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import ManageUsersPage from "./ManageUsersPage";

export default async function CreatePage() {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  return (
    <main className="container mx-auto">
      <div className="flex flex-col justify-between items-center my-3">
        <h1 className="text-3xl font-bold my-3">Manage Users</h1>
        <ManageUsersPage />
      </div>
    </main>
  );
}
