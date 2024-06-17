# BookDex

![BookDex](https://res.cloudinary.com/riyadh-main-cloud/image/upload/f_webp/q_auto:best/portfolio/bookdex/yw3plcptoa5tgfbkkwb0.png)

**BookDex** is a sleek fullstack web app to catalog and manage your book collection, built with SolidJS and Go Fiber.

## Features

- **User Auth**: Secure registration and login
- **Book Management**: Add, edit,bookmark, and delete books
- **Responsive Design**: Optimized for all devices
- **High Performance**: SolidJS & Go Fiber ensure speed

## Tech Stack

- **Frontend**: [SolidJS](https://solidjs.com/)
- **Backend**: [Go Fiber](https://gofiber.io/)
- **Database**: [MongoDB](https://www.mongodb.com/try/download/community)
- **Package Manager**: [Bun](https://bun.dev/)
- **Task Runner**: [Task](https://taskfile.dev/)

## Installation

### Prerequisites

- Node.js (v18+)
- Go (v1.20+)
- MongoDB
- Bun
- Task

### Setup

1. **Install Task**

   Follow the instructions [here](https://taskfile.dev/installation/) to install Task.

2. **Ensure MongoDB is Running**

   Make sure you have MongoDB installed and running on your system. You can start MongoDB with:

   ```sh
   mongod
   ```

3. **Clone the Repo**

   ```sh
   git clone https://github.com/your-username/bookdex.git

   cd bookdex
   ```

4. **Install Dependencies**

   ```sh
   task install
   ```

5. **Setup Backend Environment Variables**

   in the `api` directory, rename `.env.example` to `.env` and change any values to your desired values.

6. **Seed the Database**

   ```sh
   task seed:db
   ```

7. **Run the Development Servers**

   ```sh
   task dev
   ```

## Usage

1. Ensure both backend and frontend servers are running.
2. Open [http://127.0.0.1:3001](`http://127.0.0.1:3001`) in your browser.
3. Register or log in.
4. Manage your book collection!

## Task Commands

- `task install`: Installs dependencies for both frontend and backend.
- `task dev`: Starts both frontend and backend development servers.
- `task build`: Builds the project for production.
- `task seed:db`: To seed you development database
