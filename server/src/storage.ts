import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { seedDatabase } from './seed.js';
import type { FeedDatabase, FeedPost } from './types.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(currentDir, '..');
const dataDir = path.join(serverRoot, 'data');
const publicDir = path.join(serverRoot, 'public');
const videosDir = path.join(publicDir, 'videos');
const databasePath = path.join(dataDir, 'feed.json');

let writeChain = Promise.resolve<unknown>(undefined);

async function ensureFilesystem(): Promise<void> {
  await Promise.all([
    mkdir(dataDir, { recursive: true }),
    mkdir(publicDir, { recursive: true }),
    mkdir(videosDir, { recursive: true })
  ]);
}

export async function ensureDatabase(): Promise<void> {
  await ensureFilesystem();

  try {
    await readFile(databasePath, 'utf8');
  } catch {
    await writeFile(databasePath, JSON.stringify(seedDatabase, null, 2) + '\n', 'utf8');
  }
}

export async function readDatabase(): Promise<FeedDatabase> {
  await ensureDatabase();
  const raw = await readFile(databasePath, 'utf8');
  const parsed = JSON.parse(raw) as FeedDatabase;

  return {
    posts: [...parsed.posts].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  };
}

export async function writeDatabase(nextDatabase: FeedDatabase): Promise<void> {
  await ensureFilesystem();
  writeChain = writeChain.then(async () => {
    await writeFile(databasePath, JSON.stringify(nextDatabase, null, 2) + '\n', 'utf8');
  });
  await writeChain;
}

export async function updatePosts(
  updater: (posts: FeedPost[]) => FeedPost[] | Promise<FeedPost[]>
): Promise<FeedPost[]> {
  const nextPostsPromise = writeChain.then(async () => {
    const current = await readDatabase();
    const nextPosts = await updater(current.posts);
    const nextDatabase: FeedDatabase = {
      posts: [...nextPosts].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
    };

    await writeFile(databasePath, JSON.stringify(nextDatabase, null, 2) + '\n', 'utf8');

    return nextDatabase.posts;
  });

  writeChain = nextPostsPromise.then(() => undefined);
  return nextPostsPromise;
}

export const storagePaths = {
  serverRoot,
  dataDir,
  publicDir,
  videosDir,
  databasePath
};
