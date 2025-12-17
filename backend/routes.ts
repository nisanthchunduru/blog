import express, { Request, Response, NextFunction } from 'express';
import { Cache } from './cache';
import { fetchCachedEntities, fetchCachedEntityBySlug } from './cached-entity-utils';
import { fetchCachedPageByName } from './cached-notion-entity-utils';
import { Post, Chirp, Book } from './entity';

function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function setupRoutes(app: express.Application, cache: Cache) {
  app.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = await fetchCachedPageByName(cache, 'about');
    res.render('about', page);
  }));

  app.get('/posts', asyncHandler(async (req: Request, res: Response) => {
    const posts = await fetchCachedEntities<Post>(cache, 'post');
    res.render('index', { posts });
  }));

  app.get('/posts/:postSlug', asyncHandler(async (req: Request, res: Response) => {
    const post = await fetchCachedEntityBySlug<Post>(cache, 'post', req.params.postSlug);
    if (!post) {
      res.status(404).send('Post not found');
    } else {
      res.render('post', post);
    }
  }));

  app.get('/library', asyncHandler(async (req: Request, res: Response) => {
    const books = await fetchCachedEntities<Book>(cache, 'library');
    res.render('library', { books });
  }));

  app.get('/about', (req: Request, res: Response) => {
    res.redirect('/');
  });

  app.get('/chirps', asyncHandler(async (req: Request, res: Response) => {
    const chirps = await fetchCachedEntities<Chirp>(cache, 'chirp');
    res.render('chirps', { chirps });
  }));

  app.get('/chirps/:chirpSlug', asyncHandler(async (req: Request, res: Response) => {
    const chirp = await fetchCachedEntityBySlug<Chirp>(cache, 'chirp', req.params.chirpSlug);
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
