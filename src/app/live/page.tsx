import { getLiveItems } from "@/data-access/items";
import { auth } from "@/auth";
import LivePage from "./LivePageClient";
import { requireNotBlocked } from "@/lib/auth-helpers";

export default async function LivePageWrapper() {
  const session = await auth();
  await requireNotBlocked();

  const userIsAdmin =
    session?.user?.email && process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").includes(session.user.email)
      : false;

  const isSignedIn = !!session?.user?.id;
  const allItems = await getLiveItems();

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
