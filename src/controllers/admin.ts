import type { Request, Response } from "express";
import type { ApiReq } from "../types";
import { md5 } from "../utils/md5";

export const addApp = async (req: Request, res: Response) => {
  const { mongo } = req as ApiReq;

  const applications = mongo.applications();

  if (!req.body.name || !req.body.secre) {
    return res.send("bad request");
  }
  const data = await applications.updateOne(
    { name: req.body.name },
    { $set: { secret: md5(req.body.secret) } },
    { upsert: true }
  );
  res.send(JSON.stringify(data));
};
