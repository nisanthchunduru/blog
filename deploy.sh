hugo --theme=digitalocean

cd public
git add -A

git commit -m "Rebuilding blog"

git push origin master

cd ..
