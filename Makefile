.PHONY: install lint test

install:
	pip install pytest flake8 && pip install -r requirements.txt

lint:
    flake8 backend

test:
    pytest --maxfail=3 --disable-warnings -q -v