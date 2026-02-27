export type MessageType = "text" | "image" | "file" | "system";

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  type: MessageType;
  fileUrl?: string;
  createdAt: any; // Firestore Timestamp
  seenBy: string[];
}
export interface ChatRoom {
  id: string;
  users: string[];
  type: "private";
  lastMessage?: {
    text?: string;
    senderId: string;
    type: MessageType;
    createdAt: any;
  };
  createdAt: any;
  updatedAt: any;
}
