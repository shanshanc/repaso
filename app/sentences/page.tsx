import { cookies } from "next/headers";
import { COOKIE_NAME, computeToken } from "@/lib/auth";
import { SentencesClient } from "@/components/sentences/SentencesClient";

export default async function SentencesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  const isAuthed = !secret || (!!token && token === await computeToken(secret));

  return <SentencesClient isAuthed={isAuthed} />;
}
