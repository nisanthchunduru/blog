# blog

Source code of my blog [nisanthchunduru.com](https://nisanthchunduru.com)

The blog is built upon [Notion](https://notion.so) (which serves as Content Management System) and [Express.js](https://expressjs.com) with TypeScript.

Blog posts are authored in a Notion database https://inquisitive-bumper-4db.notion.site/blog_content-0f1b55769779411a95df1ee9b4b070c9?pvs=4

## Installation

First, clone the repository

```
git clone --recurse-submodules git@github.com:nisanthchunduru/blog.git
```

Start the blog
```
npm run docker:start
```

and visit http://localhost:4567

## Deployment

```
npm run deploy
```
