"use server";

import { getSuggestionsByDocumentId } from "@/lib/db/mongo-queries";

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}
