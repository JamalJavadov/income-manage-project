# Income Manager Backend

Spring Boot backend for the Income Manager project. This setup provides a professional login/register API with JWT authentication.

## Requirements
- Java 17+
- Maven 3.9+
- PostgreSQL

## Configuration
Environment variables (defaults shown):

```
DB_URL=jdbc:postgresql://localhost:5432/income_manager
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=Y2hhbmdlLW1lLXN1cGVyLXNlY3JldC1rZXktY2hhbmdlLW1lLWNoYW5nZS1tZQ==
JWT_EXP_MINUTES=120
PORT=8080
```

> `JWT_SECRET` must be Base64-encoded.

## Run
```
mvn spring-boot:run
```

## Auth Endpoints
### Register
`POST /api/auth/register`

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

Response example:
```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "email": "jane@example.com",
  "fullName": "Jane Doe"
}
```
