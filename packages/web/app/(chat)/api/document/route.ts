import { auth } from "@/app/(auth)/actions";
import { BlockKind } from "@/components/block";
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const subject = await auth();

  if (!subject) {
    return new Response("Unauthorized", { status: 401 });
  }

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response("Not Found", { status: 404 });
  }

  const userId = subject.properties.id;
  if (document.userId !== userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const subject = await auth();

  if (!subject) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = subject.properties.id;

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: BlockKind } = await request.json();

  if (userId) {
    const document = await saveDocument({
      id,
      content,
      title,
      kind,
      userId,
    });

    return Response.json(document, { status: 200 });
  }
  return new Response("Unauthorized", { status: 401 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const subject = await auth();

  if (!subject) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = subject.properties.id;

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (document.userId !== userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response("Deleted", { status: 200 });
}
