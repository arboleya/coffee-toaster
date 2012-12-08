watch:
	build/coffee-toaster/bin/toaster . -w

compile:
	build/coffee-toaster/bin/toaster . -c

# test.clean:
# 	# do nothing

test:
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