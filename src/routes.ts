import express, { Request, Response, NextFunction } from 'express';
import { Cache } from './cache';
import { fetchNotionPageByName, fetchPosts, fetchChirps } from './notion_utils';

function extractShortIdFromSlug(slug: string): string {
  return slug.split('-')[0];
}

function findEntityBySlug<T extends { id: string }>(entities: T[], slug: string): T | undefined {
  const shortId = extractShortIdFromSlug(slug);
  return entities.find(entity => entity.id.replace(/-/g, '').substring(0, 8) === shortId);
}

async function fetchChirpBySlug(cache: Cache, slug: string) {
  const chirps = await fetchChirps({ cache });
  return findEntityBySlug(chirps, slug);
}

async function fetchPostBySlug(cache: Cache, slug: string) {
  const posts = await fetchPosts({ cache });
  return findEntityBySlug(posts, slug);
}

function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function setupRoutes(app: express.Application, cache: Cache) {
  app.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = await fetchNotionPageByName('about', { cache });
    res.render('about', page);
  }));

  app.get('/posts', asyncHandler(async (req: Request, res: Response) => {
    const posts = await fetchPosts({ cache });
    res.render('index', { posts });
  }));

  app.get('/posts/:postSlug', asyncHandler(async (req: Request, res: Response) => {
    const post = await fetchPostBySlug(cache, req.params.postSlug);
    if (!post) {
      res.status(404).send('Post not found');
    } else {
      res.render('post', post);
    }
  }));

  app.get('/shelf', asyncHandler(async (req: Request, res: Response) => {
    const page = await fetchNotionPageByName('shelf', { cache });
    res.render('shelf', page);
  }));

  app.get('/about', (req: Request, res: Response) => {
    res.redirect('/');
  });

  app.get('/chirps', asyncHandler(async (req: Request, res: Response) => {
    const chirps = await fetchChirps({ cache });
    res.render('chirps', { chirps });
  }));

  app.get('/chirps/:chirpSlug', asyncHandler(async (req: Request, res: Response) => {
    const chirp = await fetchChirpBySlug(cache, req.params.chirpSlug);
    if (!chirp) {
      res.status(404).send('Chirp not found');
    } else {
      res.render('chirp', chirp);
    }
  }));

  app.get('/oops', (req: Request, res: Response) => {
    res.render('error_500');
  });
}
