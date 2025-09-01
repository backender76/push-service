import type { Request, Response } from "express";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
import type { ApiReq, MongoHelpers } from "./types";
import { md5 } from "./utils/md5";
import { rules, validate } from "./utils/validate";
import type { Collection, Document } from "mongodb";

const router = express.Router();

const { NOT_EMPTY_STRING } = rules;

router.post(
  "/auth/:app",
  validate("body", { secret: NOT_EMPTY_STRING, user: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const { secret, user: userId, provider } = req.body;
    const { app: appName } = req.params;
    const { mongo } = req as ApiReq;

    const app = await mongo.applications().findOne({ name: appName });

    if (!app || !app.secret || app.secret !== md5(secret)) {
      return res.status(403).send({});
    }
    await createCollection(mongo, `${appName}-push-tokens`);
    const players = await getPlayersCollection(mongo, appName);

    if (!players) {
      return res.status(500).send({ code: "players" });
    }
    const player = await createPlayer(players, userId, provider);

    if (!player) {
      return res.status(500).send({ code: "player" });
    }
    const token = makeToken(
      { app: appName, player: player._id.toString(), created: Date.now() },
      process.env.JWT_SECRET || ""
    );
    console.log({ token });
    res.send({ token });
  }
);

async function getPlayersCollection(mongo: MongoHelpers, app: string) {
  const init = await createCollection(mongo, `${app}-players`);
  const players = mongo.collection(`${app}-players`);
  if (init) players.createIndex({ uid: 1, provider: 1 }, { unique: true });
  return players;
}

async function createCollection(mongo: MongoHelpers, name: string): Promise<boolean> {
  if (mongo.hasCollection(name) == false) {
    mongo.createCollection(name);
    return true;
  }
  return false;
}

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

router.post(
  "/push-token/:app",
  validate("headers", { authorization: NOT_EMPTY_STRING }),
  validate("body", { token: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const [, authToken] = req.headers.authorization!.split(/ +/);
    const jwt = jsonwebtoken.verify(authToken, process.env.JWT_SECRET || "") as AuthTokenPayload;
    const collectionName: string = `${jwt.app}-push-tokens`;
    const { mongo } = req as ApiReq;
    console.log(JSON.stringify({ jwt }));

    if (!mongo.hasCollection(collectionName)) {
      return res.status(500).send({ error: "App not initialized!" });
    }
    const collection = (req as ApiReq).mongo.collection(collectionName);
    const { token, provider } = req.body;

    await collection.updateOne(
      { player: new mongo.ObjectId(jwt.player), provider },
      { $set: { token, updated: Date.now() }, $setOnInsert: { created: Date.now() } },
      { upsert: true }
    );
    res.send({});
  }
);

export { router };
