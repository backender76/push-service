// ./node_modules/.bin/_mocha 'tests/tokens.test.ts'

import { assert } from "chai";

const url: string = "http://localhost:8585/api";

const token: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJkZW1vIiwidXNlciI6ImRlbW8iLCJjcmVhdGVkIjoxNzU1NzY0NzgwOTg3LCJpYXQiOjE3NTU3NjQ3ODB9.qQoENVuIw-QXv_r5LWHMmtdwnbwmw1m8X4ceGSuQkLI";

describe("Токены", function () {
  it("Сохранение", async function () {
    const res = await fetch(`${url}/token/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: "test", provider: "test" }),
    });
    assert.equal(res.status, 200);
  });
});
