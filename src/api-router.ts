import type { NextFunction, Request, Response } from "express";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
import type { Collection, Document } from "mongodb";
import type { ApiReq, MongoHelpers } from "./types";
import { calcSig } from "./utils/calcSig";
import { rules, validate } from "./utils/validate";

const router = express.Router();

const { NOT_EMPTY_STRING } = rules;

router.use("/:method/:app", async (req: Request, res: Response, next: NextFunction) => {
  const { mongo } = req as ApiReq;

  const app = await mongo.applications().findOne({ name: req.params.app });

  if (!app) {
    return res.status(403).send({ code: "APP" });
  }
  const payload = req.method === "POST" ? req.body : req.query;

  if (!payload || !payload.sig || payload.sig !== calcSig(payload, app.secret)) {
    return res.status(403).send({ code: "SIG" });
  }
  next();
});

router.post(
  "/auth/:app",
  validate("body", { user: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const { user: userId, provider } = req.body;
    const { app: appName } = req.params;
    const { mongo } = req as ApiReq;

    await createCollection(mongo, `${appName}-push-tokens`);
    const players = await getPlayersCollection(mongo, appName);
    await getPlayersProfilesCollection(mongo, appName);

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

async function getPlayersProfilesCollection(mongo: MongoHelpers, app: string) {
  const name: string = `${app}-players-profiles`;
  const init: boolean = await createCollection(mongo, name);
  const collection = mongo.collection(name);
  if (init) collection.createIndex({ player: 1 }, { unique: true });
  return collection;
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

router.use(
  "/:method/:app",
  validate("headers", { authorization: NOT_EMPTY_STRING }),
  (req: Request, _res: Response, next: NextFunction) => {
    const [, authToken] = req.headers.authorization!.split(/ +/);
    const jwt = jsonwebtoken.verify(authToken, process.env.JWT_SECRET || "") as AuthTokenPayload;
    (req as ApiReq).jwt = jwt;

    if (req.params.app === jwt.app) {
      next();
    } else {
      next(new Error(`Wrong app name: "${jwt.app}" != "${req.params.app}"!`));
    }
  }
);

router.post(
  "/push-token/:app",
  validate("body", { token: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
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
  }
);

router.post(
  "/profile/:app",
  validate("body", { name: NOT_EMPTY_STRING, avatar: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const { mongo, jwt } = req as ApiReq;
    const { app: appName } = req.params;

    const profiles = await getPlayersProfilesCollection(mongo, appName);

    await profiles.updateOne(
      { player: new mongo.ObjectId(jwt.player) },
      {
        $set: { name: req.body.name, avatar: req.body.avatar, updated: Date.now() },
        $setOnInsert: { created: Date.now() },
      },
      { upsert: true }
    );
    res.send({});
  }
);

export { router };
