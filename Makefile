.PHONY: install lint test

install:
	pip install pytest && pip install -r requirements.txt

lint:
    pip install flake8
    flake8 backend

test:
    pytest --maxfail=3 --disable-warnings -q -v