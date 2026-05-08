export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { checkUserTableExists } from "@/lib/db-utils";

export default async function Home() {
  const tableExists = await checkUserTableExists();

  if (!tableExists) {
    redirect("/setup");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-24 px-8">
      <h1 className="text-5xl font-extrabold mb-12 text-[#333333]">Users</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg shadow-md bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">{user.name || "Unnamed"}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
