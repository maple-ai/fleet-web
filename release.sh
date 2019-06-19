DATE=$(date +%F.%H-%M)
git tag release-$DATE
git push origin release-$DATE

# Old Ways of doing it
# set -e

# if [ "$1" == "deploy" ]; then
# 	rm -rf dist
# 	NODE_ENV=production webpack --config webpack.js --display-chunks --progress

# 	cd dist
# 	CSS=$(ls site.*.css)
# 	COMMON=$(ls common.*.js)
# 	MAIN=$(ls bundle.*.js)
# 	cd -

# 	sed -i "" "s/site.css/$CSS/g" dist/index.html
# 	sed -i "" "s/common.js/$COMMON/g" dist/index.html
# 	sed -i "" "s/bundle.js/$MAIN/g" dist/index.html

# 	# deploy
# 	cd dist
# 	gcloud compute copy-files ./* web:/usr/maple/ --project maple
# 	cd -

# 	exit 0
# fi

# ./node_modules/.bin/webpack-dev-server --config webpack.js --inline --progress --port 3000
