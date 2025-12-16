import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { Liquid } from 'liquidjs';
import dotenv from 'dotenv';
import { FilesystemCache } from './filesystem_cache';
import { Cache } from './cache';
import { setupRoutes } from './routes';
import { createCustomFileSystem, createLiquidFilters } from './template_helpers';

dotenv.config();

const app = express();
const cache = new FilesystemCache();

const templatesRoot = path.join(__dirname, '..', 'templates');
const customFs = createCustomFileSystem();
const filters = createLiquidFilters();

const engine = new Liquid({
  root: templatesRoot,
  extname: '.liquid',
  fs: customFs
});

Object.entries(filters).forEach(([name, filter]) => {
  engine.registerFilter(name, filter);
});

app.engine('liquid', (filePath: string, options: Record<string, unknown>, callback: (err: Error | null, rendered?: string) => void) => {
  engine.renderFile(filePath, options)
    .then((rendered) => callback(null, rendered))
    .catch((err) => callback(err));
});

app.set('view engine', 'liquid');
app.set('views', templatesRoot);

app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigin = 'https://cdn.statically.io';
  if (req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'static')));

setupRoutes(app, cache);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).render('error_500');
  } else {
    res.status(500).send(`<pre>${err.stack}</pre>`);
  }
});

const PORT = process.env.PORT || 4567;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(parseInt(PORT as string), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
