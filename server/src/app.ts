import crypto from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

import cors from 'cors';
import express, { type Request, type Response } from 'express';
import multer from 'multer';

import { ensureDatabase, readDatabase, storagePaths, updatePosts } from './storage.js';
import type { FeedComment, FeedPost } from './types.js';

const maxUploadBytes = 50 * 1024 * 1024;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((entry) => parseTags(entry));
  }

  if (typeof raw !== 'string') {
    return [];
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    } catch {
      // Fall back to comma parsing.
    }
  }

  return trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizePost(post: FeedPost): FeedPost {
  return {
    ...post,
    comments: [...post.comments].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    )
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, storagePaths.videosDir);
    },
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname || '.mp4') || '.mp4';
      const baseName = slugify(path.basename(file.originalname, extension)) || 'shout-video';
      callback(null, `${Date.now()}-${baseName}${extension.toLowerCase()}`);
    }
  }),
  limits: {
    fileSize: maxUploadBytes
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('video/')) {
      callback(new Error('Only video uploads are supported.'));
      return;
    }

    callback(null, true);
  }
});

export async function createApp() {
  await ensureDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/videos', express.static(storagePaths.videosDir));

  app.get('/health', async (_request: Request, response: Response) => {
    const database = await readDatabase();
    response.json({
      status: 'ok',
      postCount: database.posts.length,
      storage: 'local-json',
      videosPath: storagePaths.videosDir
    });
  });

  app.get('/api/feed/posts', async (_request: Request, response: Response) => {
    const database = await readDatabase();
    response.json({
      posts: database.posts.map(normalizePost)
    });
  });

  app.post('/api/feed/posts/:id/like', async (request: Request, response: Response) => {
    const { id } = request.params;
    let updatedPost: FeedPost | undefined;

    const posts = await updatePosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== id) {
          return post;
        }

        updatedPost = {
          ...post,
          likes: post.likes + 1
        };

        return updatedPost;
      })
    );

    if (!updatedPost) {
      response.status(404).json({ error: `Post ${id} was not found.` });
      return;
    }

    response.json({
      post: normalizePost(updatedPost),
      totalPosts: posts.length
    });
  });

  app.post('/api/feed/posts/:id/comments', async (request: Request, response: Response) => {
    const { id } = request.params;
    const authorName = typeof request.body.authorName === 'string' && request.body.authorName.trim()
      ? request.body.authorName.trim()
      : 'Anonymous';
    const text = typeof request.body.text === 'string' ? request.body.text.trim() : '';

    if (!text) {
      response.status(400).json({ error: 'Comment text is required.' });
      return;
    }

    let updatedPost: FeedPost | undefined;

    await updatePosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== id) {
          return post;
        }

        const nextComment: FeedComment = {
          id: crypto.randomUUID(),
          authorName,
          text,
          createdAt: new Date().toISOString()
        };

        updatedPost = {
          ...post,
          comments: [...post.comments, nextComment]
        };

        return updatedPost;
      })
    );

    if (!updatedPost) {
      response.status(404).json({ error: `Post ${id} was not found.` });
      return;
    }

    response.status(201).json({
      post: normalizePost(updatedPost)
    });
  });

  app.post('/api/shouts/upload', upload.single('video'), async (request: Request, response: Response) => {
    const file = request.file;
    const authorName = typeof request.body.authorName === 'string' && request.body.authorName.trim()
      ? request.body.authorName.trim()
      : 'Anonymous';
    const caption = typeof request.body.caption === 'string' ? request.body.caption.trim() : '';
    const location = typeof request.body.location === 'string' && request.body.location.trim()
      ? request.body.location.trim()
      : undefined;
    const tags = parseTags(request.body.tags);

    if (!file) {
      response.status(400).json({ error: 'A video file is required in the video form field.' });
      return;
    }

    if (!caption) {
      await unlink(file.path).catch(() => undefined);
      response.status(400).json({ error: 'Caption is required.' });
      return;
    }

    const newPost: FeedPost = {
      id: `post-${crypto.randomUUID()}`,
      authorName,
      caption,
      location,
      tags,
      videoFilename: file.filename,
      videoUrl: `/videos/${file.filename}`,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    await updatePosts((currentPosts) => [newPost, ...currentPosts]);

    response.status(201).json({
      post: normalizePost(newPost)
    });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      response.status(400).json({ error: error.message });
      return;
    }

    if (error instanceof Error) {
      response.status(400).json({ error: error.message });
      return;
    }

    response.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
}
