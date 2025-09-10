import type { Request, Response } from "express";
import type { ApiReq } from "../types";

export const token = async (req: Request, res: Response) => {
  const { token, provider } = req.body;
  const { mongo, jwt } = req as ApiReq;
  const collectionName: string = `${jwt.app}-push-tokens`;

  if (!mongo.hasCollection(collectionName)) {
    return res.status(500).send({ error: "App not initialized!" });
  }
  const pushTokens = mongo.collection(collectionName);

  await pushTokens.updateOne(
    { player: new mongo.ObjectId(jwt.player), provider },
    { $set: { token, updated: Date.now() }, $setOnInsert: { created: Date.now() } },
    { upsert: true }
  );
  res.send({});
};
