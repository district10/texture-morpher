all: README.html
%.html: %.md
	pandoc --ascii $< -o $@
clean:
	rm README.html
gh:
	git add -A; git commit -m "<--...-->"; git push;


