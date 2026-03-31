.PHONY: pyway-info pyway-validate pyway-migrate

# In many macOS setups, pip installs console scripts to the user base bin
# (e.g. ~/Library/Python/3.x/bin) which may not be on PATH.
PYWAY ?= $(shell python3 -c "import os,site; print(os.path.join(site.getuserbase(),'bin','pyway'))")

# Uses .pyway.conf in this directory by default (override with `PYWAY_CONFIG_FILE` env var).
pyway-info:
	$(PYWAY) info -c .pyway.conf

pyway-validate:
	$(PYWAY) validate -c .pyway.conf

pyway-migrate:
	$(PYWAY) migrate -c .pyway.conf

