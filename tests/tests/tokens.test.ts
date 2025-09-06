// ./node_modules/.bin/_mocha 'tests/tokens.test.ts'

import { assert } from "chai";
import { calcSig } from "../../src/utils/calcSig";
import { md5 } from "../../src/utils/md5";

const url: string = "http://localhost:8585/api";

const token: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJkZW1vIiwicGxheWVyIjoiNjhiNWE4NTVhOWVhY2I3NjM5YjY5Zjc3IiwiY3JlYXRlZCI6MTc1NjczNzMwNDE4NiwiaWF0IjoxNzU2NzM3MzA0fQ.JxbsuYc3PBR91z8Z3eM2ErcnJF7A4bim-BGuCT44OoM";

describe("Токены", function () {
  it("Сохранение", async function () {
    const res = await fetch(`${url}/push-token/demo`, body({ token: "test", provider: "test" }));
    assert.equal(res.status, 200);
  });
});

function body(body: Record<string, string>): RequestInit {
  body.sig = calcSig(body, md5("demo"));

  return {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
  };
}
