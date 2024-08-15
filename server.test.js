import { expect, jest, test } from "@jest/globals";
import { build } from "./server.js";

describe("App Initialisation", () => {
  let app;
  beforeAll(async () => {
    app = await build();
    await app.ready();
  });
  it("Should have puppeteer registered as a decorator", async () => {
    expect(app.hasDecorator("puppeteer")).toBe(true);
  });
  it("Should connect browser when ready hook is called", async () => {
    expect(app.puppeteer.browser).toHaveProperty("connected", true);
  });
  it("Should disconnect browser when onClose hook is called", async () => {
    await app.close();
    expect(app.puppeteer.browser).toHaveProperty("connected", false);
  });
});

describe("Fastify + puppeteer integration", () => {
  let app;
  beforeAll(async () => {
    app = await build();
    await app.ready();
  });
  test("Empty response should return 400", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });
    expect(response.statusCode).toBe(400);
  });
  test("Valid url should return page info", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
      query: { url: "https://en.wikipedia.org/wiki/Canada" },
    });
    expect(response.statusCode).toBe(200);
    expect(response).toHaveProperty("body");
    expect(typeof response.body).toBe("string");
  });
  afterAll(async () => {
    app = await app.close();
  });
});