import { build } from "./server.js";


const server = build({ log: "info" });

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
});
