import type { Collection, Document } from "mongodb";
import type { Request } from "express";

export interface MongoHelpers {
  ObjectId: any;
  collection(name: string): Collection<Document>;
  hasCollection(name: string): boolean;
  createCollection(name: string): Collection<Document>;
  createCollectionIfNotExists(name: string): Promise<boolean>;
  applications(): Collection<Document>;
  players(app: string): Promise<Collection<Document>>;
  playersProfiles(app: string): Promise<Collection<Document>>;
}

export interface ApiReq extends Request {
  mongo: MongoHelpers;
  jwt: AuthTokenPayload;
}
