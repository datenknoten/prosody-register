export PATH := node_modules/.bin:$(PATH)

dist/index.js: node_modules src/templates/form.twig.ts src/controller/registration.controller.ts src/models/registration.model.ts src/validators/custom-email.validator.ts
	tsc

src/templates/%.twig.ts: src/templates/%.twig
	twigjs --module node $^
	mv $^.js $@

node_modules: package.json
	npm install
