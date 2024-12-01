import axios from "axios";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import * as types from "./types";
const axiosCreds = axios.create({
  withCredentials: true,
});

export class Client {
  private token: string | null = null;

  constructor() {}

  /**
   * Logs in the user using the provided credentials and stores the token in memory.
   * @param identifier The user's identifier (e.g., username, email).
   * @param password The user's password.
   * @returns The token received from the login API.
   */
  public async login(identifier: string, password: string): Promise<void> {
    if (this.token) {
      console.log("Already logged in.");
      return;
    }

    const url = "https://birdr.vercel.app/api/v1/auth/login";
    const data: types.LoginRequest = { identifier, password };
    try {
      const response: types.LoginResponse = await axiosCreds.post(url, data, {
        headers: {
          "User-Agent": "BoykisserBot Meow!",
          "Content-Type": "application/json",
        },
      });
      const token = response.data.token;

      if (token) {
        this.token = token;
        axiosCreds.interceptors.request.use(
          (config) => {
            config.headers["Cookie"] = `token=${token}`;
            return config;
          },
          (error) => {
            return Promise.reject(error);
          },
        );
        console.log("Login successful");
      } else {
        throw new Error("Token not received");
      }
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Returns the stored token if it exists in memory, otherwise logs in first.
   * @param identifier The user's identifier (e.g., username, email).
   * @param password The user's password.
   * @returns The stored token.
   */
  public async getToken(identifier: string, password: string): Promise<string> {
    if (this.token) {
      return this.token;
    }

    await this.login(identifier, password);
    return this.token as string;
  }

  /**
   * Checks if the client is logged in and has a valid token.
   * @returns True if the client has a valid token, false otherwise.
   */
  public isLoggedIn(): boolean {
    return this.token !== null;
  }

  /**
   * Example API method that uses the token stored in memory.
   * @param endpoint API endpoint to call.
   * @returns Response data from the API.
   */
  public async sendMessage(content: string): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.put(
        "https://birdr.vercel.app/api/v1/posts",
        {
          content,
        },
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  public async deleteMessage(postId: string): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.delete(
        `https://birdr.vercel.app/api/v1/posts/${postId}`,
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  public async reportMessage(
    postId: string,
    content: string,
    authorId: string,
  ): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.post(
        `https://birdr.vercel.app/api/v1/reports`,
        {
          postId,
          content,
          authorId,
        },
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  public async changeUsername(username: string): Promise<any> {
    username = username.toLowerCase();
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.patch(
        `https://birdr.vercel.app/api/v1/users/@me`,
        {
          username,
        },
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  public async changeDisplayName(displayName: string): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.patch(
        `https://birdr.vercel.app/api/v1/users/@me`,
        {
          displayName,
        },
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  public async changeAvatar(avatar: string): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    let avatarData: string;

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];

    try {
      if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
        const response = await axios.get(avatar, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const mimeType = mime.lookup(avatar);

        if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
          throw new Error(
            "Unsupported image type. Only PNG, JPG, JPEG, and GIF are allowed.",
          );
        }

        avatarData = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (fs.existsSync(avatar)) {
        const filePath = path.resolve(avatar);
        const buffer = fs.readFileSync(filePath);
        const mimeType = mime.lookup(filePath);

        if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
          throw new Error(
            "Unsupported image type. Only PNG, JPG, JPEG, and GIF are allowed.",
          );
        }

        avatarData = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else {
        throw new Error("Avatar is neither a valid file path nor URL.");
      }
      const response = await axios.patch(
        `https://birdr.vercel.app/api/v1/users/@me`,
        { avatar: avatarData },
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  public async logout(): Promise<any> {
    if (!this.token) {
      throw new Error("Not logged in. Please call login() first.");
    }

    try {
      const response = await axiosCreds.post(
        `https://birdr.vercel.app/api/v1/auth/logout`,
        {
          headers: {
            "User-Agent": "BoykisserBot Meow!",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "API request failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
