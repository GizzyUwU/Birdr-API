import { Client } from "./lib/apiRequests";
const client = new Client();

const test1 = await client.login(
  "qYOoV+DUkwcfE2OC0N5ysqmIp0t8pokHI0kvfT65N8BKmXri+kXq2iT5d4OVT7Dx",
);
const test2 = await client.sendMessage("Test!");
const test3 = await client.logout();
console.log("Test 1", test1);
