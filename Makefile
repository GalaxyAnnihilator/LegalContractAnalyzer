.PHONY: install lint test

install:
    pip install -r requirements.txt
    pip install pytest

lint:
    pip install flake8
    flake8 backend

test:
    pytest --maxfail=3 --disable-warnings -q -v