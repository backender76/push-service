// ./node_modules/.bin/_mocha 'tests/validate.test.ts'

import { assert } from "chai";
import { validate, ValidationRules } from "../../src/utils/validate";

function check(data: any, rules: ValidationRules) {
  return new Promise((resolve) => {
    const middleware = validate("body", rules);
    const req = { body: data };
    const res = { status: () => res, send: () => resolve(false) };
    const next = () => resolve(true);
    middleware(req, res, next);
  });
}

describe("Валидация.", function () {
  it("Пустой логин", async function () {
    const res = await check({ login: "" }, { login: ["required", "string"] });
    assert.equal(res, false);
  });

  it("Не пустой логин", async function () {
    const res = await check({ login: "login" }, { login: ["required", "string"] });
    assert.equal(res, true);
  });

  it("Пустое не обязательное поле", async function () {
    const res = await check({ login: "" }, { login: ["string"] });
    assert.equal(res, true);
  });
});
