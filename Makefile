.PHONY: install lint test

install:
    pip install -r requirements.txt
    pip install pytest

lint:
    flake8 .

test:
    pytest --maxfail=1 --disable-warnings -q