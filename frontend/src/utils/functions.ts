import { IDeckCard, ILibraryCard, IRecentAnswer } from "./types";

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

export function convertToILibraryCard(rawDocument: Omit<ILibraryCard, "uploadDate"> & {uploadDate: string}) : ILibraryCard {
  if (!rawDocument) {
    throw new Error("Error: Convertion to ILibraryCard failed!"); 
  }

  const isoString: string = rawDocument.uploadDate ? rawDocument.uploadDate.replace(" ", "T") + "Z" : "";
  const newDocument: ILibraryCard = {
    ...rawDocument,
    uploadDate: new Date(isoString),
  }

  return newDocument;
}

export function convertToIDeckCard(rawDeck: Omit<IDeckCard, "createdAt" | "lastAccessed"> & {createdAt: string, lastAccessed: string}) : IDeckCard {
  if (!rawDeck) {
    throw new Error("Error: Convertion to IDeckCard failed!"); 
  }

  const formatIsoString = (dateString: string): string => {
    if (!dateString) {
      return "";
    }

    return dateString.includes(" ") ? dateString.replace(" ", "T") + "Z" : dateString;
  }
  
  const newDeck: IDeckCard = {
    ...rawDeck,
    createdAt: new Date(formatIsoString(rawDeck.createdAt)),
    lastAccessed: new Date(formatIsoString(rawDeck.lastAccessed)),
  }

  return newDeck;
}

export function convertToIRecentAnswer(rawAnswer: Omit<IRecentAnswer, "answerDate"> & {answerDate: string}): IRecentAnswer {
  if (!rawAnswer) {
    throw new Error("Error: Convertion to IRecentAnswer failed!"); 
  }

  const isoString: string = rawAnswer.answerDate ? rawAnswer.answerDate.replace(" ", "T") + "Z" : "";
  const newAnswer: IRecentAnswer = {
    ...rawAnswer,
    answerDate: new Date(isoString),
  }

  return newAnswer;
}