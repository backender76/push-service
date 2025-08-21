import type { Request, Response } from "express";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
import type { ApiReq, MongoHelpers } from "./types";
import { md5 } from "./utils/md5";
import { rules, validate } from "./utils/validate";

const router = express.Router();

const { NOT_EMPTY_STRING } = rules;

router.post(
  "/auth/:app",
  validate("body", { secret: NOT_EMPTY_STRING, user: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const { secret, user } = req.body;
    const app = await (req as ApiReq).mongo.applications().findOne({ name: req.params.app });

    if (!app || !app.secret || app.secret !== md5(secret)) {
      return res.status(403).send({});
    }
    const token = makeToken({ app: req.params.app, user, created: Date.now() }, process.env.JWT_SECRET || "");
    console.log({ token });
    await createCollection((req as ApiReq).mongo, `${req.params.app}-tokens`);
    res.send({ token });
  }
);

async function createCollection(mongo: MongoHelpers, name: string): Promise<any> {
  if (mongo.hasCollection(name) == false) {
    return mongo.createCollection(name);
  }
}

function makeToken(data: any, secres: string): string {
  if (!secres) throw new Error("JWT_SECRET is empty!");
  return jsonwebtoken.sign(data, secres);
}

router.post(
  "/token/:app",
  validate("headers", { authorization: NOT_EMPTY_STRING }),
  validate("body", { token: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  async (req: Request, res: Response) => {
    const [, authToken] = req.headers.authorization!.split(/ +/);
    const jwt: any = jsonwebtoken.verify(authToken, process.env.JWT_SECRET || "");
    const collectionName: string = `${jwt.app}-tokens`;
    console.log(JSON.stringify({ jwt }));

    if (!(req as ApiReq).mongo.hasCollection(collectionName)) {
      return res.status(500).send({ error: "App not initialized!" });
    }
    const collection = (req as ApiReq).mongo.collection(collectionName);
    const { token, provider } = req.body;
    await collection.updateOne({ user: jwt.user, provider }, { $set: { token } }, { upsert: true });
    res.send({});
  }
);

export { router };
