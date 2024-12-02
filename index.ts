import { Client } from "./lib/apiRequests";
const client = new Client();

const test1 = await client.login(
  "TOKEN",
);
const test2 = await client.sendMessage("Test!");
const test3 = await client.logout();
console.log("Test 1", test1);
