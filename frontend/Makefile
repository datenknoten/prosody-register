export PATH := node_modules\.bin:$(PATH)

dist/styles.css: node_modules dist/index.js

dist/index.js:
	webpack --color

node_modules: package.json
	npm install
