import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'TypeScript Express backend is running' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});