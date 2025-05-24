.PHONY: setup build run clean

setup:
	@echo "Setting up the project..."
	npm install
	chmod +x scripts/*.sh

build: setup
	@echo "Building the project..."
	./scripts/build.sh

run: build
	@echo "Running the application..."
	./scripts/run.sh

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -f test.db

install-app:
	@echo "Please follow the instructions in slack/INSTALLATION.md to install the Slack app"
	@echo "After installation, update .env file with your tokens"