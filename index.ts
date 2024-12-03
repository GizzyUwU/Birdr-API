import axios from "axios";
import fs from "fs";
import path from "path";
import mime from "mime";
import * as types from "./types";

export class Client {
  private token: string | null = null;

  public async login(token: string): Promise<types.user> {
    if (this.token) return Promise.reject("Already logged in.");

    const url = "https://birdr.vercel.app/api/v1/users/@me";
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "BirdrTS",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      this.token = token;
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async sendPost(content: string): Promise<types.post> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    try {
      const response = await axios.put(
        "https://birdr.vercel.app/api/v1/posts",
        {
          content,
        },
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async sendComment(
    postId: string,
    content: string,
  ): Promise<types.comment> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    try {
      const response = await axios.put(
        `https://birdr.vercel.app/api/v1/posts/${postId}/comments`,
        {
          content,
        },
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async deleteComment(
    commentId: string,
  ): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    try {
      const response = await axios.delete(
        `https://birdr.vercel.app/api/v1/comments/${commentId}`,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async deletePost(
    postId: string,
  ): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    try {
      const response = await axios.delete(
        `https://birdr.vercel.app/api/v1/posts/${postId}`,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async unfollow(
    username: string,
  ): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");
    username = username.toLowerCase();
    try {
      const response = await axios.delete(
        `https://birdr.vercel.app/api/v1/users/${username}/follov`,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async follow(
    username: string,
  ): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");
    username = username.toLowerCase();
    try {
      const response = await axios.put(
        `https://birdr.vercel.app/api/v1/users/${username}/follov`,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async report(
    postId: string,
    content: string,
    type: string,
    authorId: string,
  ): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    const reportData: {
      content: string;
      authorId: string;
      [key: string]: string;
    } = {
      content,
      authorId,
    };

    if (type === "comment") {
      reportData.commentId = postId;
    } else if (type === "post") {
      reportData.postId = postId;
    } else {
      return Promise.reject(
        "Invalid type. Must be either 'post' or 'comment'.",
      );
    }

    try {
      const response = await axios.post(
        `https://birdr.vercel.app/api/v1/reports`,
        reportData,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async updateUserInfo(updates: {
    username?: string;
    displayName?: string;
    avatar?: string;
  }): Promise<types.user> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];

    try {
      if (updates.username) {
        updates.username = updates.username.toLowerCase();
      }

      if (updates.avatar) {
        let avatarData: string;

        if (
          updates.avatar.startsWith("http://") ||
          updates.avatar.startsWith("https://")
        ) {
          const response = await axios.get(updates.avatar, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data, "binary");
          const mimeType = mime.getType(updates.avatar);

          if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
            throw new Error(
              "Unsupported image type. Only PNG, JPG, JPEG, and GIF are allowed.",
            );
          }

          avatarData = `data:${mimeType};base64,${buffer.toString("base64")}`;
        } else if (fs.existsSync(updates.avatar)) {
          const filePath = path.resolve(updates.avatar);
          const buffer = fs.readFileSync(filePath);
          const mimeType = mime.getType(filePath);

          if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
            return Promise.reject(
              "Unsupported image type. Only PNG, JPG, JPEG, and GIF are allowed.",
            );
          }

          avatarData = `data:${mimeType};base64,${buffer.toString("base64")}`;
        } else {
          return Promise.reject("Avatar is neither a valid file path nor URL.");
        }

        updates.avatar = avatarData;
      }

      const response: types.user = await axios.patch(
        `https://birdr.vercel.app/api/v1/users/@me`,
        updates,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }

  public async killToken(): Promise<{ data: { message: string } }> {
    if (!this.token)
      return Promise.reject("Not logged in. Please call login() first.");

    try {
      const response = await axios.post(
        `https://birdr.vercel.app/api/v1/auth/logout`,
        {
          headers: {
            "User-Agent": "BirdrTS",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.response?.data || error.message);
    }
  }
}
