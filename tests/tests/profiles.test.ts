// ./node_modules/.bin/_mocha 'tests/profiles.test.ts'

import { assert } from "chai";
import { calcSig } from "../../src/utils/calcSig";
import { md5 } from "../../src/utils/md5";

const API_URL: string = "http://localhost:8585/api";

describe("Профили", function () {
  it("Сохранение", async function () {
    const token1 = await getToken("demo-1");
    const res1 = await fetch(`${API_URL}/profile/demo`, body({ name: "name-1", avatar: "avatar" }, token1));
    assert.equal(res1.status, 200);
    const json1 = await res1.json();

    const token2 = await getToken("demo-2");
    const res2 = await fetch(`${API_URL}/profile/demo`, body({ name: "name-2", avatar: "avatar" }, token2));
    const json2 = await res2.json();

    assert.notEqual(json1.id, json2.id);
  });
});

async function getToken(user: string = "demo"): Promise<string> {
  const res = await fetch(`${API_URL}/auth/demo`, body({ user, provider: "android" }));
  const json = await res.json();
  return json.token;
}

function body(body: Record<string, string>, token?: string): RequestInit {
  body.sig = calcSig(body, md5("demo"));

  return {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
  };
}
