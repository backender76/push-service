// ./node_modules/.bin/_mocha 'tests/auth.test.ts'

import { assert } from "chai";
import { calcSig } from "../../src/utils/calcSig";
import { md5 } from "../../src/utils/md5";

const API_URL: string = "http://localhost:8585/api";

describe("Авторизация", function () {
  it("Получение токена", async function () {
    const res = await fetch(`${API_URL}/auth/demo`, body({ user: "demo", provider: "android" }));
    const json = await res.json();
    assert.equal(res.status, 200, "Код статуса");
    assert.exists(json.token, "Токен");
  });
});

function body(body: Record<string, string>): RequestInit {
  body.sig = calcSig(body, md5("demo"));

  return {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  };
}
