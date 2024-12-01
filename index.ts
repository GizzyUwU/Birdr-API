import { Client } from "./lib/apiRequests";
const client = new Client();

client
  .login("IDENTIFIER", "PASSWORD")
  .then(() => {
    client
      .sendMessage("Test")
      .then((data) => {
        console.log("Fetched data:", data);
        client.logout().then((logoutdata) => {
          console.log("Logout Data", logoutdata);
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  })
  .catch((error) => {
    console.error("Error logging in:", error);
  });
