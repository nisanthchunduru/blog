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

### GCP

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
```

#### GCP Cloud Functions

```sh
cd infra/google-cloud/
terraform init
cd ../..
task deploy2gcp
```

### Google Cloud VM

Set `GOOGLE_CLOUD_SERVER_USERNAME` in `.env`. The deployment tasks resolve the VM named `blog` through `gcloud`.

To update the Cloudflare `A` record to the Google Cloud VM's current external IP, set `CLOUDFLARE_API_TOKEN`. Override `CLOUDFLARE_ZONE_NAME`, `CLOUDFLARE_DNS_RECORD_NAME`, and `CLOUDFLARE_DNS_RECORD_PROXIED` when needed.

```sh
task update-dns-record
```

Install Caddy for HTTPS on the Google Cloud VM:

```sh
task gcloud-server:allow-https
task gcloud-server:install-caddy
```

Deploy the blog:

```sh
task deploy
```
