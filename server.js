import Fastify from "fastify";

function build(options = {}) {
  const app = Fastify(options);

  app.register(import("./scraper.js"));

  app.route({
    method: "GET",
    url: "/",
    schema: {
      querystring: {
        type: "object",
        properties: {
          url: { type: "string" },
        },
        required: ["url"],
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          data: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => ({
      data: await app.puppeteer.scrapeSite(request.query.url),
    }),
  });

  return app;
}

export { build };
