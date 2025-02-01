import { auth } from "@/app/(auth)/actions";
import { getChatsByUserId } from "@/lib/db/mongo-queries";

export async function GET() {
  const subject = await auth();

  if (!subject) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: subject.properties.id! });
  return Response.json(chats);
}
