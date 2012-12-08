.PHONY: build

watch:
	build/coffee-toaster/bin/toaster . -w

build:
	build/coffee-toaster/bin/toaster . -c

test: build
	node_modules/vows/bin/vows spec/*.coffee --spec

publish:
	git tag $(v)
	git push origin $(v)
	git push origin master
	npm publish

re-publish:
	git tag -d $(v)
	git tag $(v)
	git push origin :$(v)
	git push origin $(v)
	git push origin master -f
	npm publish -f