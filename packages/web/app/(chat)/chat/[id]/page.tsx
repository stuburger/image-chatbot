import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Chat } from "@/components/chat";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/mongo-queries";
import { convertToUIMessages } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { auth } from "@/app/(auth)/actions";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const subject = await auth();

  if (chat.visibility === "private") {
    if (!subject) {
      return notFound();
    }

    if (subject.properties.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={!subject || subject.properties.id !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
