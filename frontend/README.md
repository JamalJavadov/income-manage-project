# Income Manager Minimal Frontend

This is a lightweight HTML/JS UI for the Income Manager auth API.

## Run
1. Start the backend from the repo root:
   ```bash
   mvn spring-boot:run
   ```
2. Open `frontend/index.html` in VS Code and use the Live Server extension, or open it directly in your browser.
3. Confirm the API base URL matches your backend (default: `http://localhost:8080`).

## Features
- Register new users.
- Login and display the JWT response.
- Store and clear the token in `localStorage`.
