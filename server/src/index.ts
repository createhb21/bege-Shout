import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '127.0.0.1';

const app = await createApp();

app.listen(port, host, () => {
  console.log(`Bege Shout prototype API listening on http://${host}:${port}`);
});
