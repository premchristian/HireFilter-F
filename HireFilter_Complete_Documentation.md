# HireFilter - AI-Powered Recruitment & Applicant Tracking Platform (Complete Documentation)

---

# PART 1: FRONTEND DOCUMENTATION

## Project Title
HireFilter - AI-Powered Recruitment & Applicant Tracking Platform (Frontend)

## Overview
The HireFilter frontend represents a modern, responsive user interface built to seamlessly connect HR professionals, Candidates, and Administrators. It leverages a rigorous frontend architecture that integrates an AI chatbot, real-time messaging, intuitive dashboards, and applicant tracking systems. The project follows a modular approach ensuring scalable UI development and robust state management. This documentation serves as a comprehensive guide for developers, system architects, and stakeholders to understand the structure, data flow, component hierarchy, and architectural patterns of the HireFilter React/Next.js application, making it fully ready for UML generation and Spiral Model iterations.

## Tech Stack
*   **Core Frameworks:** Next.js (App Router), React, React DOM
*   **3D / Interactive:** `@splinetool/react-spline`, `@splinetool/runtime` (for immersive UI experiences)
*   **Networking / API:** `axios` (HTTP Client), Websocket Client (real-time events)
*   **Styling & UI:** Tailwind CSS, `postcss`, `clsx`, `tailwind-merge`
*   **Animations:** `framer-motion`, `gsap` (GreenSock)
*   **Icons & Assets:** `lucide-react`, `react-icons`
*   **Data Visualization:** `recharts`
*   **Document Processing:** `html2canvas`, `jspdf` (for PDF generation), `xlsx` (Excel parsing/exporting)
*   **Utilities:** `date-fns` (Date parsing/formatting)

## UI Architecture
The UI is strictly segregated into structural layers ensuring Separation of Concerns (SoC).
*   **`app/`**: Next.js 13+ App Router directory defining all routes, page-level layouts (`layout.js`), and server/client page entry points (`page.js`).
*   **`components/`**: Houses all reusable stateless and stateful React components (atoms, molecules, organisms).
*   **`context/`**: Contains React Context API providers handling global application states (e.g., Auth, Theme, Chatbot).
*   **`lib/`**: Contains standard configurations, third-party library abstractions (like WebSocket clients), and core utilities.
*   **`utils/`**: General helper/utility functions, pure logic functions, and formatting utilities.
*   **`public/`**: Stores static assets (images, icons, manifest, etc.).

## Pages / Screens
The visual interface is organized across distinct role-based sub-systems:
*   **Public/Authentication**
    *   **`/` (Root)**: Landing page featuring immersive elements (`SplineScene`, `SmokeCanvas`, `Hero`).
    *   **`login`**: Secure user authentication gateway.
    *   **`Register`**: User onboarding and role selection form.
    *   **`forgot-password`**: Password recovery sequence.
*   **Role-Based Dashboards**
    *   **`candidate/`**: Candidate portal for profile management, job searching, and application tracking.
    *   **`hr/`**: Dashboard for Human Resources to post jobs, review applications, and manage interview schedules.
    *   **`admin/`**: System administrative features, user management, and platform analytics.
*   **Functional/Utility**
    *   **`chatbot-demo`**: Isolated environment for interacting with the AI-driven assistant.
    *   **`maintenance`**: Rendered during system downtimes/upgrades.
    *   **`not-found`**: Custom 404 error page.

## Components
The component architecture promotes reusability. Key components include:
*   **Global/Layout:** `Navbar`, `Footer`, `Logo`, `Providers` (Context Wrappers), `Skeleton` (Loading states).
*   **Landing/Marketing:** `Hero`, `Features`, `CTA`, `Stats`.
*   **Interactive/3D:** `SplineScene`, `SmokeCanvas`, `SmokeSimulation`.
*   **Functional modules:**
    *   `LoginForm`: Authentication logic encapsulates form validation and submission.
    *   `chatbot`: Floating AI assistant component managing contextual user prompts.
    *   `messaging`: Real-time chat interface connecting HRs and candidates.

## State Management
The project utilizes React Context APIs to maintain global state, avoiding prop-drilling:
*   **`ChatbotContext`**: Manages the AI chatbot's visibility, conversation history array, loading state, and prompt responses.
*   **`JobContext`**: Central store for job listings, filtering criteria, selected jobs, and pagination data.
*   **`MaintenanceContext`**: Controls the application's global access depending on server status or scheduled downtime flags.
*   **`NotificationContext`**: Global toast/notification queue to alert users on success, error, or real-time event occurrences.

## API Integration
All backend communications are abstracted via dedicated modules:
*   **HTTP Protocol (`axios`)**: Handles RESTful requests (GET, POST, PUT, DELETE) specifically structured through `check_api.js` and `utils/auth` interceptors.
*   **Interceptors**: Attaches JWT tokens in headers for protected routes and handles response errors globally (e.g., 401 Unauthorized redirect).
*   **Real-time Protocol (`lib/websocket-client`)**: Establishes persistent WS/WSS connections. Subscribes to channels for live chat and instant applicant notifications.

## User Flow
The primary paths a user traverses within the application:
1.  **Onboarding Journey**: `landing` -> `Register` -> (Email Verification) -> `login` -> Role redirect (`hr`, `candidate`, `admin`).
2.  **Job Application (Candidate)**: `candidate dashboard` -> Browse/Search Jobs -> View Job details -> Apply (Uploads resume, triggers Notification).
3.  **Recruitment Pipeline (HR)**: `hr dashboard` -> Create Job -> View Applicants -> Review/Status update -> Send Message/Offer via `messaging` component.
4.  **System Governance (Admin)**: `login` -> `admin dashboard` -> Manage users -> View Analytics via `recharts`.
5.  **Assistance**: Any screen -> Click Chatbot icon -> Query AI -> Receive localized help based on `ChatbotContext`.

## Routing
HireFilter utilizes the **Next.js App Router** paradigm mapping directory structures to URL paths.
*   Directory paths in `app/` resolve automatically (e.g., `app/hr/page.js` parses to route `/hr`).
*   Nested layouts ensure consistent UI frames per user role.
*   Server-Side Rendering (SSR) and Client-Side Navigation are dynamically balanced.

## Folder Structure
```text
hirefilter/
├── app/                  # Route definitions and pages
│   ├── Register/
│   ├── admin/
│   ├── candidate/
│   ├── hr/
│   └── globals.css       # Core global styling
├── components/           # Reusable UI Pieces
│   ├── chatbot/
│   ├── messaging/
│   └── (Atoms/Molecules)
├── context/              # Global state providers
├── lib/                  # WS, third-party plugin wrappers
├── public/               # Static assets & splines
└── utils/                # Helper functions (auth, formatting)
```

## Styling Approach
*   **`tailwindcss`**: Utility-first CSS is utilized extensively inline for rapid styling.
*   **`postcss`**: Transforms styles, automates browser prefixing, and purges unused CSS.
*   **`globals.css`**: Defines CSS variables, custom root themes, font-families, and global tailwind `@apply` directives.
*   **Dynamic Classes**: `clsx` and `tailwind-merge` are utilized across components to conditionally join classes without collisions.

## Notes for UML Diagrams
This section details the explicit architectural traits designed for UML (Unified Modeling Language) generation and Spiral Model Integration.

### 1. Class Diagram Considerations
When building the Class Diagram for the frontend, define the logical entities mapping to the state managers and prop interfaces:
*   **UserEntity**: (Attributes: `id`, `role`, `token`, `name`, `email`). Associated with `login` and `Register` pages.
*   **JobEntity**: (Attributes: `title`, `description`, `skills`, `salary`, `company`). Managed strictly by `JobContext`.
*   **ChatbotController**: A singleton-like class deriving from `ChatbotContext` managing `messages[]`, `isOpen` boolean, and `sendMessage(string)` method.
*   **WebsocketClient**: Class in `lib/` featuring `connect()`, `disconnect()`, `subscribe(topic)`, and `emit(event, payload)`.
*   **UI Components**: Map components as UI objects inherited from `React.Component` / React Nodes, dependent on the contexts. Display Aggregation (e.g., `Navbar` aggregates `Logo`).

### 2. Sequence Diagram Scenarios
*   **Authentication Sequence**: User -> `LoginForm` (Submits Credentials) -> `axios/auth` -> API Gateway -> (Returns JWT) -> `AuthContext` Updates -> Main Router (Redirects to Role Dashboard).
*   **Real-time Messaging Sequence**: HR -> `messaging` UI -> `sendMessage()` -> `websocket-client` -> Backend WS Server -> (Broadcast) -> Candidate `NotificationContext` & `messaging` UI -> Receives Update.
*   **Job Fetching**: Candidate Page mounts -> Calls `JobContext.fetchJobs()` -> API `/jobs` (GET) -> Waits for Promise -> Resolves -> React local State updates -> Renders Job list.

### 3. Activity Diagram Nodes
*   **Role-based Login**: Start -> Input Credentials -> Valid? (No -> Show Error, Yes -> check Role) -> If HR -> Route `/hr` -> Load HR Dashboard -> End.
*   **Job Creation (HR)**: Start -> Form Input -> Validate Input constraints -> Generate request payload -> Send POST -> Success notification -> Refresh `JobContext` -> End.

### 4. Use Case Diagram Actors
*   **Unauthenticated User**: Can View Landing Page, Register, Login, triggers Forgot Password.
*   **Candidate**: Can Search Jobs, Submit Applications, View Application Status, Chat with HR.
*   **HR**: Can Post Jobs, View Applications, Update Applicant Status (Hired/Rejected), Message Candidates.
*   **Admin**: Can View System Logs, Manage Accounts, Initiate System `MaintenanceContext`.

### 5. Spiral Model Documentation Application
The Frontend is developed using the iterative **Spiral Model** to manage technical risks (complex State interactions, WS latency, AI Chatbot generation logic):
*   **Quadrant 1: Determine Objectives**
    *   **Iteration 1 (MVP)**: Basic routing (`app/`), static dashboards (`hr`, `candidate`), generic login.
    *   **Iteration 2**: API integration via Axios, JWT state handling, dynamic rendering of Job context.
    *   **Iteration 3**: Real-time messaging, AI Chatbot integrations, 3D Canvas visual polish.
*   **Quadrant 2: Identify & Resolve Risks**
    *   *Risk*: State desynchronization. *Resolution*: Implement robust `Contexts` replacing local states.
    *   *Risk*: WS Server drops. *Resolution*: Reconnection wrappers in `lib/websocket-client`.
    *   *Risk*: High load times for Spline. *Resolution*: Lazy loading and `Skeleton` wrappers.
*   **Quadrant 3: Development & Test**
    *   Building UI Components. Integration tests focusing on `axios` interceptors. Validation against Postman mocks using `check_api.js`. Testing PDF/Excel exports (`html2canvas`, `xlsx`).
*   **Quadrant 4: Plan the Next Iteration**
    *   User feedback dictates the next feature (e.g., adding advanced graphing via `recharts` for the Admin side based on Phase 2 deliverables).

---

# PART 2: BACKEND DOCUMENTATION

## Project Title
HIRE FILTER Backend

## Overview
The Hire Filter Backend is a robust, highly scalable RESTful API coupled with real-time WebSocket communication, specifically engineered for a modern recruitment platform. It provides comprehensive administrative and user-facing features, seamlessly connecting Candidates (Users), Recruiters (HRs), and System Administrators (Admins). 

Core capabilities include:
- **Identity & Access Management:** Secure, role-based JWT authentication with OTP verification.
- **Job Management Engine:** Complete lifecycle management for job postings, including dynamic search and advanced filtering.
- **Application & Ranking System:** An automated applicant tracking system that integrates customizable evaluation exams and dynamic candidate ranking based on skills and assessment scores.
- **Real-time Communication:** Instant peer-to-peer messaging and typing indicators powered by Socket.io.
- **Systematic Notifications:** Automated and manual real-time alerts across various triggers (application status changes, messages, job alerts).
- **Dashboard Analytics:** Aggregated metrics for tracking platform health, job statistics, and applicant engagement.

## Tech Stack
- **Runtime & Framework:** Node.js, Express.js
- **Database & ORM:** MongoDB, Mongoose
- **Real-Time Engine:** Socket.io
- **Security & Authentication:** JSON Web Token (JWT), Bcrypt (password hashing), express-mongo-sanitize, Rate Limiting middlewares
- **File Management & Storage:** Multer (local parsing), Cloudinary (remote visual/document asset storage)
- **Email Service:** Nodemailer (OTP and systemic emails)
- **Testing environment:** Jest, Supertest

## System Architecture
The project strictly follows a **Client-Server RESTful API Architecture** implementing a refined **Model-Route-Controller-Service-Repository (MRCSR)** layered pattern, operating alongside **Real-time WebSocket Communication** for instantaneous data pushing.

1. **Presentation/Route Layer (Routes):** Intercepts HTTP requests and delegates to specific controllers. Includes middleware for auth and input validation.
2. **Controller Layer (Controllers):** Handles HTTP request/response formatting, status codes, and delegates core business logic to the service layer.
3. **Business Logic Layer (Services):** Contains the core algorithmic and business rules (e.g., candidate ranking computations, exam evaluation).
4. **Data Access Layer (Repositories):** Abstracts direct database calls from the service layer, utilizing Mongoose queries to interact with MongoDB.
5. **Data Layer (Models):** Defines Mongoose schemas, relationships, constraints, and indexes.

## Modules
1. **Authentication:** Registration, login, OTP sending/verification, password reset, logout.
2. **Users:** Profile management, asset uploads (avatar, resume, portfolio), role management (Admin, HR, User).
3. **Jobs:** Job creation, advanced text-indexed search, statistics, soft/hard deletion.
4. **Applications:** Applying, withdrawal, skill matching, status tracking (Applied -> Hired/Rejected).
5. **Exams/Assessments:** HR-driven question banks, evaluation engines, candidate exam attempts, automated grading.
6. **Ranks:** Dynamic sorting and calculation of candidate compatibility against job requirements.
7. **Messages:** Private chat conversations mapping 1:1 user relations.
8. **Notifications:** System alerts mapped to users.
9. **Dashboard:** Aggregated administrative metrics.
10. **Health:** System uptime and latency checks.

## API Endpoints
- `/api/auth` (POST /signup, POST /login, POST /send-signup-otp, POST /verify-signup-otp, POST /forgot-password, POST /reset-password)
- `/api/users` (GET /profile, PUT /profile, GET /admin/all)
- `/api/jobs` (POST /, GET /, GET /:id, PUT /:id, DELETE /soft/:id, GET /stats)
- `/api/application` (POST /apply, GET /user, GET /job/:id, PUT /status)
- `/api/exams` (POST /create, POST /attempt, GET /results)
- `/api/ranks` (GET /job/:id/ranks)
- `/api/messages` (GET /conversation, POST /send)
- `/api/notifications` (GET /all, PUT /read)
- `/api/dashboard` (GET /metrics)
- `/health` (GET /)

*(Note: Parameters and exact routes may expand as development continues but fall under these base URIs)*

## Database Schema
The database strictly relies on relational patterns mapped within MongoDB via references (`ref`):
1. **Users:** Contains PII, auth data, dynamic role arrays, address, profile assets (skills, resume), company info (for HR).
2. **Jobs:** Contains structured arrays for required skills, nested salary/experience config, job status, creator references (`User` ID).
3. **Applications:** Links `User` and `Job`. Tracks complex arrays (skills matched/missing), timeline states (status), and multiple scores (exam, skill, rank).
4. **Exams & QuestionBanks:** `Exam` links to `Job`. `QuestionBank` maps questions to specific `Exam` IDs.
5. **ExamAttempts:** Tracks transient candidate answers mapping back to `QuestionBank` and `Application`.
6. **Conversations & Messages:** A `Conversation` tracks Participant Arrays. `Message` maps to `Conversation`, tracking `Sender`, `Receiver`, content, and read receipts.
7. **Notifications:** Maps a `Recipient`, standardizes notification types, and houses metadata.

## Data Flow
Client Request -> Express App setup (CORS, Rate Limiter) -> Route Matcher -> Middleware Execution (Auth/Roles/Sanitization) -> Controller function -> Service execution -> Repository data fetch -> Mongoose Model -> MongoDB -> Reverse propagation -> JSON Response.

**Mathematical/Logical representation:**
`Client → [Middleware Layer] → [Route] → [Controller] → [Service] → [Repository] → [Database] → [Controller] → Client`

## Authentication & Authorization
- **Authentication Strategy:** JSON Web Token (JWT) utilizing Bearer strategy in the Authorization header.
- **Tokens:** Short-to-medium lifespan signatures containing the `userId`. 
- **Middlewares:**
  - `authMiddleware`: Decodes JWT, validates user existence in DB, blockades unauthorized API access.
  - `authorizeRoles(...roles)`: RBAC (Role-Based Access Control) checking if `req.user.role` intersects with allowed endpoint roles (e.g., "admin", "hr").
- **State Security:** Passwords hashed via Bcrypt with salt rounds, and endpoints secured globally against NoSQL injection via `express-mongo-sanitize`.

## Error Handling
- **Architecture:** Express Global Error Handling Middleware.
- **Standardized Output Format:**
  `{ statusCode: <int>, success: false, message: <string>, errors: <array>, data: null }`
- **Catchers:** Syntax Error Catcher (filters invalid JSON bodies at the threshold), Native MongoError Catchers (handling strict unique constraint violations dynamically), and Async Wrappers around controllers to funnel unhandled exceptions straight to the central error middleware.

## Folder Structure
- `/config` - Database and environment configurations
- `/constants` - System-wide immutable variables 
- `/controllers` - Request handlers returning structured responses
- `/middlewares` - Request interceptors (Auth, Multer, Validation, Rate Limiter)
- `/models` - Mongoose Schemas definitions
- `/repositories` - Abstracted MongoDB queries
- `/routes` - Express endpoint declarations routing to controllers
- `/services` - Distinct business logic handlers decoupled from routing
- `/socket` - Real-time Socket.io namespace and event configuration
- `/tests` - Local validation suites (Jest testing)
- `/uploads` - Ephemeral local storage for form processing
- `/utils` - Helpers (OTP generator, Hashers, API Response formatting)
- `/validations` - Joi/Zod-style request body schemas (if implemented)
- `/public` - Static assets 

## Deployment / Environment Configuration
- **Environment Manager:** `dotenv` managing isolated `.env` configurations.
- **Variables:** `PORT`, `MONGO_URI`, `JWT_SECRET`, SMTP credentials (`EMAIL_USER`, `EMAIL_PASS`), Cloudinary Keys (`CLOUDINARY_URL`, etc.), `FRONTEND_URL`.
- **Node Scripts:** `npm run dev` (Nodemon hot-reloading) and `npm start` (Standard Node runtime execution).

---

## Notes for UML Diagrams

*This section provides granular data meant explicitly for the generation of structural and behavioral UML diagrams.*

### 1. UML Class Diagram Details
- **User Class:**
  - *Attributes:* `_id`, `name`, `email`, `password`, `role: enum(admin, hr, user)`, `isActive`, `profile: Object`, `company: Object`, `otp`, `isEmailVerified`.
  - *Methods / Operations:* `hashPassword()`, `comparePassword()`, `generateToken()`.
  - *Relationships:* 1-to-many with `Job` (createdBy), 1-to-many with `Application`, 1-to-many with `Message` (sender/receiver).
- **Job Class:**
  - *Attributes:* `jobTitle`, `companyName`, `jobType`, `salary: {min, max}`, `requiredSkills: String[]`, `jobStatus`, `isActive`.
  - *Relationships:* Many-to-1 with `User` (Recruiter), 1-to-many with `Application`. 1-to-1 with `Exam`.
- **Application Class:**
  - *Attributes:* `jobId`, `userId`, `status`, `score`, `rank`, `matchedSkills[]`, `examScore`.
  - *Relationships:* Many-to-1 with `Job`, Many-to-1 with `User`.
- **Message & Conversation Classes:**
  - *Conversation Attributes:* `participants: User[]`, `lastMessage`.
  - *Message Attributes:* `conversationId`, `sender`, `receiver`, `content`, `isRead`.
  - *Relationships:* 1 Conversation contains Many Messages. 
- **Exam & ExamAttempt Classes:**
  - *Attributes:* `jobId`, `title`, `durationMinutes`, `passingMarks`. 
  - *Attempt Attributes:* `userId`, `examId`, `score`, `status`, `answers`.

### 2. UML Sequence Diagram Details
- **Authentication Flow (Sign Up):**
  1. `Client` -> `Route (/send-signup-otp)`
  2. `Route` -> `Controller (sendSignupOtp)`
  3. `Controller` -> `Nodemailer Service` (Sends OTP to Email)
  4. `Client` -> `Route (/signup)` (Sends User Data + OTP)
  5. `Controller` -> `DB (reads OTP)` -> validates -> hashes password -> `DB (saves User)`
  6. Returns JWT & HTTP 201 Success.
- **Job Application & Ranking Flow:**
  1. `Candidate` -> `/apply/:jobId`
  2. `Application Controller` -> `Application Service`
  3. `Service` pulls Candidate `User.profile.skills` & `Job.requiredSkills` -> Calculates initial match score.
  4. `Service` -> `DB` (Creates Application record).
  5. Notification event fired via `Socket.io` to HR.
- **Messaging (Real-Time) Flow:**
  1. `UserA` triggers `socket.emit("typing")` -> `Server SocketHandler` -> broadcasts to `UserB`'s room `socket.to(UserB).emit("display_typing")`.
  2. `UserA` -> HTTP POST `/messages/send`
  3. `Message Controller` saves to `MongoDB`.
  4. `Controller` invokes Socket Server to emit `"new_message"` directly to `UserB`.

### 3. UML State Diagram Details
- **Application Status States:** 
  `Applied` -> `Screening` -> `Interviewing` -> `Shortlisted` -> `Offer` -> `Hired`
  *(Transitions can also route to `Rejected` from any state, or `Archived` as terminal).*
- **Exam Attempt States:**
  `Started` -> `Queued` (for AI processing) -> `Evaluating` -> `Evaluated` / `Failed`.

### 4. UML Activity Diagram Details
- **HR Posting a Job & Exam process:**
  [Login] -> [Validate HR Role] -> [Submit Job Details] -> [DB Save Job] -> [Prompt to create Assessment] -> [Define Questions / Marks] -> [Activate Exam] -> [End].

---

## Spiral Model Documentation for Development Lifecycle

*For project management and process documentation, the Hire Filter system heavily leverages an iterative, risk-driven **Spiral Model** framework. This ensures modular scaling (e.g., adding AI evaluation without breaking fundamental auth).*

### Phase 1: Planning and Objectives Definition
- **Objective:** Identify core stakeholder needs (Admins, Recruiters, Candidates).
- **Actions:** Gathering API specifications, defining database scale out strategies (MongoDB), choosing core tools (Node, Express, Socket.io).
- **Deliverables:** Architectural drafts, initial JSON Schema definitions, basic wireframe plans.

### Phase 2: Risk Assessment and Analysis
- **Objective:** Identify potential bottlenecks and security flaws before heavy coding.
- **Identified Risks:** Unverified users spamming APIs, brute-force password attacks, database NoSQL injection, real-time socket memory leaks.
- **Mitigation:** Implement OTP email verification *before* account creation, integrate `bcrypt` for hashes, setup `express-mongo-sanitize`, implement Rate Limiters (`authLimiter`, `generalLimiter`).

### Phase 3: Engineering and Execution (Iterative Builds)
*The project is built in layered iterations:*
- **Iteration 1 (Foundation):** Setup Express, MongoDB connection, Global Error Handlers, and Authentication modules (JWT, OTP).
- **Iteration 2 (Business Entities):** Job models, User profile expansions, Application models, building out CRUD REST endpoints.
- **Iteration 3 (Complex Logic & Scaling):** Exam creation engines, automatic candidate ranking logic, skill-matching algorithms.
- **Iteration 4 (Real-Time Subsystem):** Integrating Socket.io handling rooms, typing indicators, pushing immediate status notifications.

### Phase 4: Evaluation, Testing, and Deployment
- **Objective:** Client and systemic validation.
- **Actions:** Writing unit tests using Jest, simulating endpoint loads with Supertest.
- **Deliverables:** Stable releases mapped to staging environments, eventual production push using PM2/Docker (future steps), evaluating user feedback to feed back into Phase 1 of the next spiral loop (e.g., adding Video Interviews).
