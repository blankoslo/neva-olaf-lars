"use server";

import prisma from "@/lib/prisma";

export async function checkUserTableExists(): Promise<boolean> {
  try {
    await prisma.user.findFirst();
    return true;
  } catch {
    return false;
  }
}
