# blog

Source code of my blog [nisanthchunduru.com](https://nisanthchunduru.com)

The blog is built upon [Notion](https://notion.so) (which serves as Content Management System) and [Express.js](https://expressjs.com) with TypeScript.

Blog posts are authored in a Notion database https://inquisitive-bumper-4db.notion.site/blog_content-0f1b55769779411a95df1ee9b4b070c9?pvs=4

## Installation

First, clone the repository

```
git clone --recurse-submodules git@github.com:nisanthchunduru/blog.git
```

Install dependencies

```
./setup
```

Start the blog

```
mise run start
```

and visit http://localhost:3001

## Deployment

### AWS

```sh
cd infra/aws/
terraform init
cd ../..
task deploy2aws
```

### GCP Cloud VM

Create a GCP project and create a Cloud VM named `blog` in that project

Install `gcloud-cli`

```sh
curl https://sdk.cloud.google.com | bash
```

Authenticate

```sh
gcloud auth application-default login
gcloud config set project actual-project-id
gcloud auth application-default set-quota-project actual-project-id
```

Add `GOOGLE_CLOUD_PROJECT_ID` env var to `.env` and run

```sh
vim .env
```
```sh
GOOGLE_CLOUD_PROJECT_ID=actual-project-id
GOOGLE_CLOUD_SERVER_USERNAME=actual-username
```

Deploy

```
task deploytogcpvm
```

#### Update DNS record

Add `CLOUDFLARE_API_TOKEN` env var to .env

```sh
task update-dns-record
```

#### Setup HTTPS

Add a GCP firewall rule to allow traffic to port 443

```
task gcloud-server:allow-https
```

Install Caddy

```sh
task gcloud-server:install-caddy
```
