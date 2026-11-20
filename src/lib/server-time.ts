import { connection } from "next/server";

export async function getServerNowMs(): Promise<number> {
  await connection();
  return Date.now();
}
