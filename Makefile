all: README.html
%.html: %.md
	pandoc --ascii $< -o $@
clean:
	rm README.html

