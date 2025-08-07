.PHONY: install lint test

install:
    pip install -r requirements.txt
    pip install pytest

test:
    pytest --maxfail=3 --disable-warnings -q -v