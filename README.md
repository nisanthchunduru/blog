# blog

Source code of my blog [nisanthchunduru.com](https://nisanthchunduru.com)

The blog is built upon [Notion](https://notion.so) and [Express.js](https://expressjs.com) with TypeScript.

Blog posts are authored in Notion https://inquisitive-bumper-4db.notion.site/blog_content-0f1b55769779411a95df1ee9b4b070c9?pvs=4 which serves as a CMS (Content Management System).

![image](https://github.com/nisanthchunduru/nisanthchunduru.github.io/assets/1789832/f9a6bf9d-9994-46cf-bdce-baf7d8ef9f04)

![image](https://github.com/nisanthchunduru/nisanthchunduru.github.io/assets/1789832/02804010-47b9-4f57-800c-908272c5868b)

## Installation

First, clone the repository
```
cd ~/Projects/
git clone --recurse-submodules git@github.com:nisanthchunduru/blog.git
```

Install dependencies
```
npm install
```

To view the blog in your browser, run
```
npm run dev
```
and visit http://localhost:4567

## Deployment

The blog is deployed from GitHub Actions
