# Project Title
HireFilter - AI-Powered Recruitment & Applicant Tracking Platform (Frontend)

# Overview
The HireFilter frontend represents a modern, responsive user interface built to seamlessly connect HR professionals, Candidates, and Administrators. It leverages a rigorous frontend architecture that integrates an AI chatbot, real-time messaging, intuitive dashboards, and applicant tracking systems. The project follows a modular approach ensuring scalable UI development and robust state management. This documentation serves as a comprehensive guide for developers, system architects, and stakeholders to understand the structure, data flow, component hierarchy, and architectural patterns of the HireFilter React/Next.js application, making it fully ready for UML generation and Spiral Model iterations.

# Tech Stack
*   **Core Frameworks:** Next.js (App Router), React, React DOM
*   **3D / Interactive:** `@splinetool/react-spline`, `@splinetool/runtime` (for immersive UI experiences)
*   **Networking / API:** `axios` (HTTP Client), Websocket Client (real-time events)
*   **Styling & UI:** Tailwind CSS, `postcss`, `clsx`, `tailwind-merge`
*   **Animations:** `framer-motion`, `gsap` (GreenSock)
*   **Icons & Assets:** `lucide-react`, `react-icons`
*   **Data Visualization:** `recharts`
*   **Document Processing:** `html2canvas`, `jspdf` (for PDF generation), `xlsx` (Excel parsing/exporting)
*   **Utilities:** `date-fns` (Date parsing/formatting)

# UI Architecture
The UI is strictly segregated into structural layers ensuring Separation of Concerns (SoC).
*   **`app/`**: Next.js 13+ App Router directory defining all routes, page-level layouts (`layout.js`), and server/client page entry points (`page.js`).
*   **`components/`**: Houses all reusable stateless and stateful React components (atoms, molecules, organisms).
*   **`context/`**: Contains React Context API providers handling global application states (e.g., Auth, Theme, Chatbot).
*   **`lib/`**: Contains standard configurations, third-party library abstractions (like WebSocket clients), and core utilities.
*   **`utils/`**: General helper/utility functions, pure logic functions, and formatting utilities.
*   **`public/`**: Stores static assets (images, icons, manifest, etc.).

# Pages / Screens
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

# Components
The component architecture promotes reusability. Key components include:
*   **Global/Layout:** `Navbar`, `Footer`, `Logo`, `Providers` (Context Wrappers), `Skeleton` (Loading states).
*   **Landing/Marketing:** `Hero`, `Features`, `CTA`, `Stats`.
*   **Interactive/3D:** `SplineScene`, `SmokeCanvas`, `SmokeSimulation`.
*   **Functional modules:**
    *   `LoginForm`: Authentication logic encapsulates form validation and submission.
    *   `chatbot`: Floating AI assistant component managing contextual user prompts.
    *   `messaging`: Real-time chat interface connecting HRs and candidates.

# State Management
The project utilizes React Context APIs to maintain global state, avoiding prop-drilling:
*   **`ChatbotContext`**: Manages the AI chatbot's visibility, conversation history array, loading state, and prompt responses.
*   **`JobContext`**: Central store for job listings, filtering criteria, selected jobs, and pagination data.
*   **`MaintenanceContext`**: Controls the application's global access depending on server status or scheduled downtime flags.
*   **`NotificationContext`**: Global toast/notification queue to alert users on success, error, or real-time event occurrences.

# API Integration
All backend communications are abstracted via dedicated modules:
*   **HTTP Protocol (`axios`)**: Handles RESTful requests (GET, POST, PUT, DELETE) specifically structured through `check_api.js` and `utils/auth` interceptors.
*   **Interceptors**: Attaches JWT tokens in headers for protected routes and handles response errors globally (e.g., 401 Unauthorized redirect).
*   **Real-time Protocol (`lib/websocket-client`)**: Establishes persistent WS/WSS connections. Subscribes to channels for live chat and instant applicant notifications.

# User Flow
The primary paths a user traverses within the application:
1.  **Onboarding Journey**: `landing` -> `Register` -> (Email Verification) -> `login` -> Role redirect (`hr`, `candidate`, `admin`).
2.  **Job Application (Candidate)**: `candidate dashboard` -> Browse/Search Jobs -> View Job details -> Apply (Uploads resume, triggers Notification).
3.  **Recruitment Pipeline (HR)**: `hr dashboard` -> Create Job -> View Applicants -> Review/Status update -> Send Message/Offer via `messaging` component.
4.  **System Governance (Admin)**: `login` -> `admin dashboard` -> Manage users -> View Analytics via `recharts`.
5.  **Assistance**: Any screen -> Click Chatbot icon -> Query AI -> Receive localized help based on `ChatbotContext`.

# Routing
HireFilter utilizes the **Next.js App Router** paradigm mapping directory structures to URL paths.
*   Directory paths in `app/` resolve automatically (e.g., `app/hr/page.js` parses to route `/hr`).
*   Nested layouts ensure consistent UI frames per user role.
*   Server-Side Rendering (SSR) and Client-Side Navigation are dynamically balanced.

# Folder Structure
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

# Styling Approach
*   **`tailwindcss`**: Utility-first CSS is utilized extensively inline for rapid styling.
*   **`postcss`**: Transforms styles, automates browser prefixing, and purges unused CSS.
*   **`globals.css`**: Defines CSS variables, custom root themes, font-families, and global tailwind `@apply` directives.
*   **Dynamic Classes**: `clsx` and `tailwind-merge` are utilized across components to conditionally join classes without collisions.

# Notes for UML Diagrams
This section details the explicit architectural traits designed for UML (Unified Modeling Language) generation and Spiral Model Integration.

## 1. Class Diagram Considerations
When building the Class Diagram for the frontend, define the logical entities mapping to the state managers and prop interfaces:
*   **UserEntity**: (Attributes: `id`, `role`, `token`, `name`, `email`). Associated with `login` and `Register` pages.
*   **JobEntity**: (Attributes: `title`, `description`, `skills`, `salary`, `company`). Managed strictly by `JobContext`.
*   **ChatbotController**: A singleton-like class deriving from `ChatbotContext` managing `messages[]`, `isOpen` boolean, and `sendMessage(string)` method.
*   **WebsocketClient**: Class in `lib/` featuring `connect()`, `disconnect()`, `subscribe(topic)`, and `emit(event, payload)`.
*   **UI Components**: Map components as UI objects inherited from `React.Component` / React Nodes, dependent on the contexts. Display Aggregation (e.g., `Navbar` aggregates `Logo`).

## 2. Sequence Diagram Scenarios
*   **Authentication Sequence**: User -> `LoginForm` (Submits Credentials) -> `axios/auth` -> API Gateway -> (Returns JWT) -> `AuthContext` Updates -> Main Router (Redirects to Role Dashboard).
*   **Real-time Messaging Sequence**: HR -> `messaging` UI -> `sendMessage()` -> `websocket-client` -> Backend WS Server -> (Broadcast) -> Candidate `NotificationContext` & `messaging` UI -> Receives Update.
*   **Job Fetching**: Candidate Page mounts -> Calls `JobContext.fetchJobs()` -> API `/jobs` (GET) -> Waits for Promise -> Resolves -> React local State updates -> Renders Job list.

## 3. Activity Diagram Nodes
*   **Role-based Login**: Start -> Input Credentials -> Valid? (No -> Show Error, Yes -> check Role) -> If HR -> Route `/hr` -> Load HR Dashboard -> End.
*   **Job Creation (HR)**: Start -> Form Input -> Validate Input constraints -> Generate request payload -> Send POST -> Success notification -> Refresh `JobContext` -> End.

## 4. Use Case Diagram Actors
*   **Unauthenticated User**: Can View Landing Page, Register, Login, triggers Forgot Password.
*   **Candidate**: Can Search Jobs, Submit Applications, View Application Status, Chat with HR.
*   **HR**: Can Post Jobs, View Applications, Update Applicant Status (Hired/Rejected), Message Candidates.
*   **Admin**: Can View System Logs, Manage Accounts, Initiate System `MaintenanceContext`.

## 5. Spiral Model Documentation Application
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
