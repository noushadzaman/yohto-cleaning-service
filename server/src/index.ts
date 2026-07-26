import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import './types/express';
import app from './app';

const port = Number(process.env.PORT) || 5000;
const host =
  process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0');

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`Environment loaded from: ${path.join(__dirname, '../.env')}`);
  console.log(`Admin email configured: ${process.env.ADMIN_EMAIL ? 'Yes' : 'No'}`);
});