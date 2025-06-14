import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import { GetItemAction } from "../../manage/actions";
import EditItemForm from "../../manage/EditItemForm";

interface EditItemPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  // Fix: Use the already awaited 'id' instead of 'params.id'
  const itemId = parseInt(id);

  if (isNaN(itemId)) {
    redirect("/items/manage");
  }

  try {
    const item = await GetItemAction(itemId);

    return (
      <main className="container mx-auto py-3">
        <h1 className="text-3xl font-bold">Edit Item: {item.name}</h1>
        <EditItemForm item={item} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching item:", error);
    redirect("/items/manage");
  }
}
