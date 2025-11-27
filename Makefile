.PHONY: serve serve-bg open stop clean help all

PORT := 8080
SERVER_LOG := /tmp/babylon_server.log

.DEFAULT_GOAL := all

serve:
	@echo "Starting Babylon.js server on port $(PORT)..."
	@python3 -m http.server $(PORT)

serve-bg:
	@echo "Starting Babylon.js server in background on port $(PORT)..."
	@pkill -f "python3.*http.server.*$(PORT)" 2>/dev/null || true
	@sleep 1
	@bash -c "cd $(shell pwd) && nohup python3 -m http.server $(PORT) > $(SERVER_LOG) 2>&1 &" && sleep 2
	@if pgrep -f "python3.*http.server.*$(PORT)" > /dev/null; then \
		echo "✓ Server started successfully"; \
		echo "✓ Server log: $(SERVER_LOG)"; \
		echo "✓ Game available at: http://localhost:$(PORT)"; \
	else \
		echo "✗ Server failed to start. Check $(SERVER_LOG)"; \
		cat $(SERVER_LOG) 2>/dev/null | tail -5 || true; \
		exit 1; \
	fi

open:
	@echo "Opening game in browser..."
	@xdg-open http://localhost:$(PORT) 2>/dev/null || \
	 firefox http://localhost:$(PORT) 2>/dev/null || \
	 google-chrome http://localhost:$(PORT) 2>/dev/null || \
	 chromium http://localhost:$(PORT) 2>/dev/null || \
	 echo "Please open http://localhost:$(PORT) in your browser"

stop:
	@if [ -f /tmp/babylon_server_$(PORT).pid ]; then \
		kill $$(cat /tmp/babylon_server_$(PORT).pid) 2>/dev/null && echo "✓ Server stopped" || true; \
		rm -f /tmp/babylon_server_$(PORT).pid; \
	fi
	@pkill -f "python3.*http.server.*$(PORT)" 2>/dev/null && echo "✓ Server stopped" || echo "No server running on port $(PORT)"

all:
	@$(MAKE) serve-bg
	@sleep 2
	@$(MAKE) open
	@echo ""
	@echo "✓ 3D Point & Click Game is running!"
	@echo "✓ Server: http://localhost:$(PORT)"
	@echo "✓ To stop: make stop"

clean:
	@echo "Cleaning up..."
	@$(MAKE) stop
	@rm -f $(SERVER_LOG)
	@echo "✓ Cleaned"

help:
	@echo "Babylon.js Point & Click Game - Makefile Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make serve    - Start web server (foreground)"
	@echo "  make serve-bg - Start web server (background)"
	@echo "  make open     - Open app in browser"
	@echo "  make all      - Start server and open browser (default)"
	@echo "  make stop     - Stop the server"
	@echo "  make clean    - Stop server and clean logs"
	@echo "  make help     - Show this help"
	@echo ""
	@echo "Quick start: make all"
	@echo "Or just: make"

