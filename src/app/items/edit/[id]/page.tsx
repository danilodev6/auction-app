import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import { GetItemAction } from "../../manage/actions";
import EditItemForm from "../../manage/EditItemForm";

interface EditItemPageProps {
  params: {
    id: string;
  };
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  const itemId = parseInt(params.id);

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
