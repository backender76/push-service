import express from "express";
import { rules, validate } from "./utils/validate";
import * as middlewares from "../src/middlewares";
import * as controllers from "../src/controllers";

const { NOT_EMPTY_STRING } = rules;

const router = express.Router();

router.use("/:method/:app", middlewares.checkSig);

router.post(
  "/auth/:app",
  validate("body", { user: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  controllers.auth.jwt
);

router.use("/:method/:app", validate("headers", { authorization: NOT_EMPTY_STRING }), middlewares.jwt);

router.post(
  "/push-token/:app",
  validate("body", { token: NOT_EMPTY_STRING, provider: NOT_EMPTY_STRING }),
  controllers.push.token
);

router.post(
  "/profile/:app",
  validate("body", { name: NOT_EMPTY_STRING, avatar: NOT_EMPTY_STRING }),
  controllers.player.profile
);

export { router };
