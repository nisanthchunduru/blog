export interface Entity {
  id: string;
  name: string;
}

export interface Titleable {
  title: string;
}

export interface Contentable {
  html: string;
}

export interface Publishable {
  publishedDate: string;
}

export interface Slugable {
  slug: string;
}

export interface Draftable {
  draft?: boolean;
}

export interface Taggable {
  tags?: string[];
}

export interface Content extends Entity, Titleable, Contentable, Publishable, Slugable, Draftable, Taggable {
}

export interface Post extends Entity, Titleable, Contentable, Publishable, Slugable, Draftable, Taggable {
  name: 'post';
}

export interface Chirp extends Entity, Titleable, Contentable, Publishable, Slugable, Draftable, Taggable {
  name: 'chirp';
}

export interface Book extends Entity, Titleable {
  name: 'library';
  authors?: string;
}
