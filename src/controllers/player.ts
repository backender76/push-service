import type { Request, Response } from "express";
import type { ApiReq } from "../types";

export const profile = async (req: Request, res: Response) => {
  const { mongo, jwt } = req as ApiReq;
  const { app } = req.params;

  const profiles = await mongo.playersProfiles(app);

  await profiles.updateOne(
    { player: new mongo.ObjectId(jwt.player) },
    {
      $set: { name: req.body.name, avatar: req.body.avatar, updated: Date.now() },
      $setOnInsert: { created: Date.now() },
    },
    { upsert: true }
  );
  res.send({ id: jwt.player });
};
