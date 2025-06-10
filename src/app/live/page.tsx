import { getAllItems } from "@/data-access/items";
import { auth } from "@/auth";
import LivePage from "./LivePageClient";

export default async function LivePageWrapper() {
  const session = await auth();
  const userIsAdmin = session?.user?.email
    ? process.env.ADMIN_EMAILS?.split(",").includes(session.user.email)
    : false;

  const isSignedIn = !!session?.user?.id;
  const allItems = await getAllItems();

  return (
    <LivePage
      initialItems={allItems.map((item) => ({
        ...item,
        bidEndTime: new Date(item.bidEndTime),
      }))}
      userIsAdmin={userIsAdmin}
      isSignedIn={isSignedIn}
    />
  );
}
