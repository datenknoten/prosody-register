.PHONY: dist backend frontend

dist: backend frontend

clean:
	rm -Rf dist

backend:
	cd backend && $(MAKE)
	cp -R backend/dist .
	cp -R backend/package.json dist
	cp -R backend/src/locales dist
	cd dist && npm install --production

frontend:
	cd frontend && $(MAKE)
	mkdir -p dist/assets
	cp frontend/dist/* dist/assets

run: dist
	cd dist && node . ../config.json

debug: dist
	cd dist && node --inspect-brk . ../config.json
