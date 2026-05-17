# Bege Shout prototype API

Local-only TypeScript API for feed/community prototype work.

## Run

```bash
cd server
npm install
npm run seed:videos
npm start
```

Server defaults to `http://127.0.0.1:4000`.

## Scripts

- `npm start` — run the local API
- `npm run dev` — watch mode
- `npm run typecheck` — TypeScript validation
- `npm run seed:videos` — regenerate sample MP4 assets with `ffmpeg`

## Endpoints

- `GET /health`
- `GET /api/feed/posts`
- `POST /api/feed/posts/:id/like`
- `POST /api/feed/posts/:id/comments`
- `POST /api/shouts/upload` (`multipart/form-data`, file field: `video`)

## Upload example

```bash
curl -X POST http://127.0.0.1:4000/api/shouts/upload \
  -F "authorName=Demo User" \
  -F "caption=First prototype shout" \
  -F "location=Seoul" \
  -F "tags=prototype,launch" \
  -F "video=@./public/videos/sample-sunset-loop.mp4;type=video/mp4"
```
