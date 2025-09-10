// ./node_modules/.bin/_mocha 'tests/auth.test.ts'

import { assert } from "chai";
import { calcSig } from "../../src/utils/calcSig";
import { md5 } from "../../src/utils/md5";

const API_URL: string = "http://localhost:8585/api";

describe("Авторизация", function () {
  it("Получение токена", async function () {
    const res1 = await fetch(`${API_URL}/auth/demo`, body({ user: "demo", provider: "android" }));
    const json1 = await res1.json();
    assert.equal(res1.status, 200, "Код статуса");
    assert.exists(json1.token, "Токен");

    const res2 = await fetch(`${API_URL}/auth/demo`, body({ user: "demo-2", provider: "android" }));
    const json2 = await res2.json();
    assert.notEqual(json1.token, json2.token);

    const res3 = await fetch(`${API_URL}/auth/demo`, body({ user: "demo", provider: "android" }));
    const json3 = await res3.json();
    assert.equal(json1.token, json3.token);
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
