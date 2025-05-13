import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateItemAction } from "./actions";

export default async function CreatePage() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Post an item</h1>
      <form
        className="border p-4 my-4 rounded-md space-y-4 max-w-lg flex items-center flex-col"
        action={CreateItemAction}
      >
        <Input
          required
          className="max-w-lg"
          name="name"
          type="text"
          placeholder="Name your item"
        />
        <Input
          required
          className="max-w-lg"
          name="startingPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="Starting Price of your item"
        />
        <Button className="self-end" type="submit">
          Post item
        </Button>
      </form>
    </main>
  );
}
