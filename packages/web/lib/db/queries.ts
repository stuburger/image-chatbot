import "server-only";
import { genSaltSync, hashSync } from "bcrypt-ts";

import {
  User,
  Chats,
  Messages,
  Votes,
  Documents,
  Suggestions,
  Suggestion,
  Message,
} from "./schema";
import { BlockKind } from "@/components/block";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await User.find({ email }).toArray();
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await User.insertOne({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await Chats.insertOne({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility: "private",
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await Votes.deleteMany({ chatId: id });
    await Messages.deleteMany({ chatId: id });

    return await Chats.deleteOne({ id });
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await Chats.find({ userId: id }).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById(
  { id }: { id: string },
  throwIfNotFound = true
) {
  try {
    const chat = await Chats.findOne({ id });
    if (!chat && throwIfNotFound) {
      throw new Error("Chat not found");
    }
    return chat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await Messages.insertMany(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await Messages.find({ chatId: id }).sort({ createdAt: 1 }).toArray();
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const existingVote = await Votes.findOne({ messageId });

    if (existingVote) {
      return await Votes.updateOne(
        { messageId, chatId },
        { $set: { isUpvoted: type === "up" } }
      );
    }
    return await Votes.insertOne({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await Votes.find({ chatId: id }).toArray();
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    return await Documents.insertOne({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await Documents.find({ id }).sort({ createdAt: 1 }).toArray();
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const document = await Documents.findOne({ id });
    if (!document) {
      throw new Error("Document not found");
    }
    return document;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await Suggestions.deleteMany({
      documentId: id,
      documentCreatedAt: { $gt: timestamp },
    });

    return await Documents.deleteMany({
      id,
      createdAt: { $gt: timestamp },
    });
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await Suggestions.insertMany(suggestions);
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await Suggestions.find({ documentId }).toArray();
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const message = await Messages.findOne({ id });
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const result = await Messages.deleteMany({
      chatId,
      createdAt: { $gte: timestamp },
    });

    // if (result.deletedCount > 0) {
    //   await Votes.deleteMany({
    //     chatId,
    //     messageId: { $in: result.deletedIds },
    //   });
    // }

    return result;
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await Chats.updateOne({ id: chatId }, { $set: { visibility } });
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}
