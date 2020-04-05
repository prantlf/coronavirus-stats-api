new-countries ::
	npm test
	git a data/countries.yml
	git c -m 'Add new countries'
	git push github master && git push

new-exclusions ::
	npm test
	git a data/excluded-countries.yml
	git c -m 'Add new excluded countries'
	git push github master && git push
