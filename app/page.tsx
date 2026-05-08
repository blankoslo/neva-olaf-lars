export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { checkUserTableExists } from "@/lib/db-utils";
import HomeChat from "./_components/home-chat";
import TabBar from "./_components/tabbar";

export default async function HomePage() {
  const tableExists = await checkUserTableExists();
  if (!tableExists) redirect("/setup");

  return (
    <>
      <HomeChat />
      <TabBar />
    </>
  );
}
