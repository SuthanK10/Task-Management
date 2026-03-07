# Task Management REST API

A complete technical assessment project demonstrating a well-structured backend REST API built with Laravel 12.x, combined with a clean vanilla Javascript frontend.

## 🚀 Technology Stack
* **Framework:** Laravel 12.x
* **Language:** PHP 8.2+, HTML5, CSS3, ES6 JavaScript
* **Database:** MySQL
* **Authentication:** Laravel Sanctum (Token-Based)

## 📌 Features Included
1. **User Authentication:** Token-based registration, login, and logout.
2. **Task Management:** RESTful CRUD endpoints for tasks (`GET`, `POST`, `PUT`, `DELETE`).
3. **Data Security:** Complete tenant isolation — users can *only* access and manage their own Tasks.
4. **Resilience (Soft Deletes):** Tasks are not permanently destroyed, but soft-deleted safely.
5. **Advanced Reading (Pagination & Filtering):** The task list supports pagination (`?page=1`) and filtering by status (`?status=completed`) or title/description search (`?search=keyword`).
6. **Input Validation:** Strict form request validation rules handling all API inputs gracefully.

---

## 💻 Local Testing & Setup Instructions

### 1. Requirements
- PHP 8.2+
- Composer
- MySQL Server

### 2. Environment Setup
Clone the repository, install dependencies, and setup the `.env` file:

```bash
git clone https://github.com/SuthanK10/Task-Management.git
cd Task-Management
composer install
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup
Create an empty database named `task_management` via your MySQL manager (or update the `.env` to match your DB credentials). Then migrate:

```bash
php artisan migrate
```

### 4. Running the Application
Start the built-in development server:

```bash
php artisan serve
```

---

## 🖥 Frontend Interface

You do not need an external API client (like Postman) to test this application. A fully functional, responsive, Vanilla JS frontend interface is included! 

Simply open your browser and navigate to the public frontend file via the server:  
👉 **`http://127.0.0.1:8000/index.html`**

*You will be greeted with an authentication screen where you can register a new account and immediately start managing your tasks.*

---

## 🔗 API Endpoints

All requests generally expect an `Accept: application/json` header and a matching JSON payload body.  
All protected routes require a Bearer token in the `Authorization` header.

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/register` | Register an account (requires name, email, password, password_confirmation) |
| POST   | `/api/login`    | Login to an account (requires email, password) |

### Authentication (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/logout`   | Invalidate the current API token |
| GET    | `/api/user`     | Return the currently authenticated user payload |

### Tasks (Protected - Scoped to User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tasks` | Returns paginated list of tasks. Supports `?status=pending` & `?search=keyword`. |
| POST   | `/api/tasks` | Create a new task (requires title). |
| GET    | `/api/tasks/{id}` | Retrieve a specific task. |
| PUT    | `/api/tasks/{id}` | Update an existing task. |
| DELETE | `/api/tasks/{id}` | Soft delete a task. |

---

## 🛠 Design Assumptions & Decisions
- **Vanilla JS Frontend:** While Laravel plays exceptionally well with Vue or React via Inertia.js, the requirements explicitly requested "a simple browser-based interface... Using plain HTML, CSS, and JavaScript". Thus, the frontend is housed completely statically in the `/public` directory utilizing the Fetch API for zero build-step simplicity.
- **Resource Ownership Middleware:** Rather than complex policy classes, task scope security is enforced efficiently at the query level directly via Eloquent Relationships (`$request->user()->tasks()->find($id)`).
- **Graceful Error Responses:** The `bootstrap/app.php` exceptions handler was overridden to intercept core Laravel routing/validation errors (404, 401, 422) and force a consistent JSON structure instead of HTML pages, explicitly catering to API consumers.
