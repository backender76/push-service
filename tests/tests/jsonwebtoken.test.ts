// ./node_modules/.bin/_mocha 'tests/jsonwebtoken.test.ts'

import jsonwebtoken from "jsonwebtoken";
import { assert } from "chai";
import * as sinon from "sinon";

const clock = sinon.useFakeTimers(new Date("2000-01-01"));

const sec = (n: number): number => n * 1000;
const min = (n: number): number => n * sec(60);
const hrs = (n: number): number => n * min(60);
const day = (n: number): number => n * hrs(24);
const yar = (n: number): number => n * day(365);

describe("jsonwebtoken", function () {
  it("Тестирование времени жизни токенов", async function () {
    assert.equal(verifyToken(day(5), "7d"), true, "Токен на 7 дней через 5 дней НЕ должен истечь.");
    assert.equal(verifyToken(day(7), "7d"), false, "Токен на 7 дней через 7 дней должен истечь.");
    assert.equal(verifyToken(day(30)), true, "Токен без ограничения времени жизни.");
    assert.equal(verifyToken(yar(10)), true, "Токен без ограничения времени жизни.");
  });
});

type Unit = "D" | "Y";
type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

function verifyToken(timeout: number, expiresIn?: `${number}${UnitAnyCase}`): boolean {
  try {
    const secret = "secret";
    const token = jsonwebtoken.sign({ foo: "bar" }, secret, expiresIn ? { expiresIn } : undefined);
    clock.tick(timeout);
    jsonwebtoken.verify(token, secret);
    return true;
  } catch (_e) {
    return false;
  }
}
