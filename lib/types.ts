export interface user {
  data: {
    _id: string;
    email: string;
    username: string;
    displayName: string;
    staff: boolean;
    verified: boolean;
    banned: boolean;
    avatarUrl: string;
    __v: number;
    otherBadges: string[];
  };
  status: number;
}

export interface message {
  data: {
    content: string;
    authorId: string;
    mentions: { [key: string]: string };
    ogData: {};
    pinned: boolean;
    _id: string;
    postedAt: Date;
    __v: number;
  };
}
