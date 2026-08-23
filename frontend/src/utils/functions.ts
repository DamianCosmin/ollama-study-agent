import { IDeckCard, ILibraryCard, IRecentAnswer, IUser, IChatMessage, IChatSession } from "./types.ts";

export function formatLastAccessedDate(date: Date): string {
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((todayStart.getTime() - dateStart.getTime()) / 86400000);

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return `${diffDays}d ago`;
  }
}

function formatBackendDate(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }

  // Pure date format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T00:00:00`);
  }

  // SQLite datetime format (YYYY-MM-DD HH:mm:ss)
  const isoFormat: string = dateString.includes(" ") ? dateString.replace(" ", "T") + "Z" : dateString;

  return new Date(isoFormat);
}

export function convertToILibraryCard(rawDocument: Omit<ILibraryCard, "uploadDate"> & {uploadDate: string}) : ILibraryCard {
  if (!rawDocument) {
    throw new Error("Error: Convertion to ILibraryCard failed!"); 
  }

  const newDocument: ILibraryCard = {
    ...rawDocument,
    uploadDate: formatBackendDate(rawDocument.uploadDate) ?? new Date(),
  }

  return newDocument;
}

export function convertToIDeckCard(rawDeck: Omit<IDeckCard, "createdAt" | "lastAccessed"> & {createdAt: string, lastAccessed: string}) : IDeckCard {
  if (!rawDeck) {
    throw new Error("Error: Convertion to IDeckCard failed!"); 
  }
  
  const newDeck: IDeckCard = {
    ...rawDeck,
    createdAt: formatBackendDate(rawDeck.createdAt) ?? new Date(),
    lastAccessed: formatBackendDate(rawDeck.lastAccessed) ?? new Date(),
  }

  return newDeck;
}

export function convertToIRecentAnswer(rawAnswer: Omit<IRecentAnswer, "answerDate"> & {answerDate: string}): IRecentAnswer {
  if (!rawAnswer) {
    throw new Error("Error: Convertion to IRecentAnswer failed!"); 
  }

  const newAnswer: IRecentAnswer = {
    ...rawAnswer,
    answerDate: formatBackendDate(rawAnswer.answerDate) ?? new Date(),
  }

  return newAnswer;
}

export function convertToIUser(rawUser: Omit<IUser, "createdAt" | "lastActive"> & {createdAt: string, lastActive: string}) : IUser {
  if (!rawUser) {
    throw new Error("Error: Convertion to IUser failed!"); 
  }

  const newUser: IUser = {
    ...rawUser,
    createdAt: formatBackendDate(rawUser.createdAt) ?? new Date(),
    lastActive: formatBackendDate(rawUser.lastActive) ?? new Date(),
  }

  return newUser;
}

export function convertToIChatMessage(rawMessage: Omit<IChatMessage, "createdAt"> & {createdAt: string}): IChatMessage {
  if (!rawMessage) {
    throw new Error("Error: Convertion to IChatMessage failed!"); 
  }

  const newMessage: IChatMessage = {
    ...rawMessage,
    createdAt: formatBackendDate(rawMessage.createdAt) ?? new Date(),
  }

  return newMessage;
}

export function convertToIChatSession(rawSession: Omit<IChatSession, "createdAt"> & {createdAt: string}): IChatSession {
  if (!rawSession) {
    throw new Error("Error: Convertion to IChatSession failed!"); 
  }

  const newSession: IChatSession = {
    ...rawSession,
    createdAt: formatBackendDate(rawSession.createdAt) ?? new Date(),
  }

  return newSession;
}