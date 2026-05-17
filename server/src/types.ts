export interface FeedComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  caption: string;
  location?: string;
  tags: string[];
  videoUrl: string;
  videoFilename: string;
  likes: number;
  comments: FeedComment[];
  createdAt: string;
}

export interface FeedDatabase {
  posts: FeedPost[];
}

export interface CreatePostInput {
  authorName: string;
  caption: string;
  location?: string;
  tags: string[];
  videoFilename: string;
}
