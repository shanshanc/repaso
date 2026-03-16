import { cookies } from "next/headers";
import { COOKIE_NAME, computeToken } from "@/lib/auth";
import { TagsClient } from "@/components/tags/TagsClient";

export default async function TagsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  const isAuthed = !secret || (!!token && token === await computeToken(secret));

  return <TagsClient isAuthed={isAuthed} />;
}
