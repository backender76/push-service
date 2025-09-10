import type { Request, Response } from "express";
import type { Collection, Document } from "mongodb";
import type { ApiReq } from "../types";
import jsonwebtoken from "jsonwebtoken";

export const jwt = async (req: Request, res: Response) => {
  const { user: userId, provider } = req.body;
  const { app } = req.params;
  const { mongo } = req as ApiReq;

  await mongo.createCollectionIfNotExists(`${app}-push-tokens`);
  const players = await mongo.players(app);
  await mongo.playersProfiles(app);

  if (!players) {
    return res.status(500).send({ code: "players" });
  }
  const player = await createPlayer(players, userId, provider);

  if (!player) {
    return res.status(500).send({ code: "player" });
  }
  const token = makeToken({ app, player: player._id.toString() }, process.env.JWT_SECRET || "");
  res.send({ token });
};

async function createPlayer(players: Collection<Document>, uid: string, provider: string) {
  const player = await players.findOne({ uid, provider });

  await players.updateOne(
    { uid, provider },
    { $set: { updated: Date.now() }, $setOnInsert: { created: Date.now() } },
    { upsert: true }
  );
  return player ? player : players.findOne({ uid, provider });
}

function makeToken(data: AuthTokenPayload, secres: string): string {
  if (!secres) throw new Error("JWT_SECRET is empty!");
  return jsonwebtoken.sign(data, secres);
}
