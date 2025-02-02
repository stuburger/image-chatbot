import { MongoClient } from "mongodb";
import { Resource } from "sst";

const client = new MongoClient(Resource.MongoUri.value);

await client.connect();

const db = client.db("chatbot");

export type User = {
  email: string;
  password?: string;
};

export type Chat = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string;
  visibility: "public" | "private";
};

export type Message = {
  chatId: string;
  role: string;
  content: any;
  createdAt: Date;
};

export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
};

export type Document = {
  id: string;
  createdAt: Date;
  title: string;
  content?: string;
  kind: "text" | "code" | "image";
  userId: string;
};

export type Suggestion = {
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
};

export const User = db.collection<User>("users");
export const Chats = db.collection<Chat>("chats");
export const Messages = db.collection<Message>("messages");
export const Votes = db.collection<Vote>("votes");
export const Documents = db.collection<Document>("documents");
export const Suggestions = db.collection<Suggestion>("suggestions");
