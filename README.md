# BirdrTS
BirdrTS is a library for the social media [Birdr](https://birdr.vercel.app/) made by [Cyteon](https://github.com/Cyteon).

## Usages
To begin, authorize the client with your Birdr API token using the login function:
```js
import { Client } from "birdr-ts";
const client = new Client();

await client.login("TOKEN")
```

Once authorized, you can access various functions to interact with Birdr, such as posting content and commenting on posts.

To post content to the account associated with the token you can use the sendPost function:
```js
await client.sendPost("CONTENT")
```

To add a comment to a post you can use the sendComment function with post id and content as parameters:
```js
await client.sendComment("POSTID", "CONTENT")
```

To delete a comment or post you can use the deleteComment/deletePost function with the id of it:
```js
await client.deleteComment("COMMENTID")
await client.deletePost("POSTID")
```

To follow or unfollow accounts you can use the function follow/unfollow with the username of the account set as a parameter:
```js
await client.follow("USERNAME")
await client.unfollow("USERNAME")
```

To report inappropriate posts or comments you can use the report function with post id content type (Type has to be either "post" or "comment") and author id parameters set.
```js
await client.report("POSTID", "CONTENT", "post", "AUTHORID")
await client.report("POSTID", "CONTENT", "comment", "AUTHORID")
```

To update the account details such as username you can use the updateUserInfo function with any parameter set. The avatar parameter can be either a file path or url.
```js
await client.updateUserInfo({ username: "USERNAME", displayName: "DISPLAYNAME", avatar: "AVATAR" })
await client.updateUserInfo({ avatar: "AVATAR" })
```

If your token becomes compromised in anyway or you just want to revoke access to it you can use the killToken function as it invalidates the token. When this function is run you will need a new token to continue using the library.
```js
await client.killToken();
```
