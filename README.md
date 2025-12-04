<div align="center">

# 🏆 Sports Unit

**Professional Sports Social Network**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

_Connect, showcase, and grow in the professional sports network._

[Getting Started](#-getting-started) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📸 Screenshots

<!-- Add screenshots here -->

|                 Landing Page                  |                  Dashboard                   |                 Profile                  |
| :-------------------------------------------: | :------------------------------------------: | :--------------------------------------: |
| ![Landing Page](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Profile](docs/screenshots/profile.png) |

|                  Discovery                   |                  Messaging                   |                    Notifications                     |
| :------------------------------------------: | :------------------------------------------: | :--------------------------------------------------: |
| ![Discovery](docs/screenshots/discovery.png) | ![Messaging](docs/screenshots/messaging.png) | ![Notifications](docs/screenshots/notifications.png) |

---

## ✨ Features

### Core Features

- 🔐 **User Authentication** - Secure registration and login with NextAuth.js
- 👤 **Rich User Profiles** - Comprehensive athlete profiles with metrics, experience, and achievements
- 🤝 **Connections** - Connect with athletes, coaches, scouts, and sports professionals
- 📝 **Posts & Feed** - Share updates, photos, and videos with your network
- 🔍 **Discovery** - Find and explore athletes with advanced filtering
- 📋 **Watchlists** - Organize and track athletes of interest
- 💬 **Real-time Messaging** - Direct messaging with Socket.io integration
- 🔔 **Notifications** - Stay updated on connections, likes, and comments
- #️⃣ **Hashtags** - Categorize and discover content with hashtags

### Profile Features

- 📊 **Athlete Metrics** - Track sprint speed, agility, beep test, and vertical jump
- 💼 **Experience** - Document team history and career progression
- 🎓 **Education** - Educational background and achievements
- 📜 **Certifications** - Professional certifications and credentials
- 🏅 **Awards** - Showcase achievements and recognitions
- 🌍 **Languages** - Language proficiency levels

### User Roles

- 🏃 **Athletes** - Showcase skills and connect with opportunities
- 🧑‍🏫 **Coaches** - Discover talent and build teams
- 🔭 **Scouts** - Find and track promising athletes
- 👥 **Fans** - Follow and support favorite athletes

---

## 🛠 Tech Stack

### Frontend

| Technology                                      | Purpose                         |
| ----------------------------------------------- | ------------------------------- |
| [Next.js 16](https://nextjs.org/)               | React framework with App Router |
| [React 19](https://react.dev/)                  | UI library                      |
| [TypeScript](https://www.typescriptlang.org/)   | Type-safe JavaScript            |
| [Tailwind CSS 4](https://tailwindcss.com/)      | Utility-first CSS framework     |
| [shadcn/ui](https://ui.shadcn.com/)             | Accessible component library    |
| [React Hook Form](https://react-hook-form.com/) | Form management                 |
| [TanStack Query](https://tanstack.com/query)    | Server state management         |
| [Lucide Icons](https://lucide.dev/)             | Beautiful icons                 |

### Backend

| Technology                                                                                         | Purpose                 |
| -------------------------------------------------------------------------------------------------- | ----------------------- |
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Backend API             |
| [Prisma ORM](https://www.prisma.io/)                                                               | Database ORM            |
| [PostgreSQL](https://www.postgresql.org/)                                                          | Relational database     |
| [NextAuth.js](https://next-auth.js.org/)                                                           | Authentication          |
| [Zod](https://zod.dev/)                                                                            | Schema validation       |
| [Socket.io](https://socket.io/)                                                                    | Real-time communication |
| [AWS S3](https://aws.amazon.com/s3/)                                                               | Media storage           |

---

## 📁 Project Structure

```
sports_unit_v2/
├── app/                      # Next.js App Router
│   ├── (main)/              # Main app routes (grouped)
│   ├── api/                 # API route handlers
│   │   ├── auth/            # Authentication endpoints
│   │   ├── connections/     # Connection management
│   │   ├── discovery/       # Discovery & search
│   │   ├── messages/        # Messaging API
│   │   ├── notifications/   # Notifications API
│   │   ├── posts/           # Post CRUD operations
│   │   ├── profile/         # Profile management
│   │   └── ...
│   ├── dashboard/           # User dashboard
│   ├── discovery/           # Athlete discovery page
│   ├── inbox/               # Messaging inbox
│   ├── notifications/       # Notifications page
│   ├── onboarding/          # User onboarding flow
│   ├── profile/             # User profiles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles & theme
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── connections/         # Connection components
│   ├── dashboard/           # Dashboard components
│   ├── discovery/           # Discovery components
│   ├── landing/             # Landing page components
│   ├── messaging/           # Messaging components
│   ├── notifications/       # Notification components
│   ├── onboarding/          # Onboarding components
│   ├── posts/               # Post components
│   ├── profile/             # Profile components
│   ├── watchlists/          # Watchlist components
│   └── widgets/             # Shared widgets
├── hooks/                   # Custom React hooks
│   ├── useConnections.ts    # Connection management
│   ├── useDiscovery.ts      # Discovery & search
│   ├── useMessaging.ts      # Real-time messaging
│   ├── useNotifications.ts  # Notification handling
│   ├── usePosts.ts          # Post operations
│   ├── useProfile.ts        # Profile management
│   └── ...
├── lib/                     # Utility libraries
│   ├── api-utils.ts         # API response helpers
│   ├── auth-utils.ts        # Auth utilities
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # General utilities
├── services/                # Business logic layer
│   ├── auth.ts              # Authentication service
│   ├── connections.ts       # Connection service
│   ├── discovery.ts         # Discovery service
│   ├── messaging.ts         # Messaging service
│   ├── notifications.ts     # Notification service
│   ├── posts.ts             # Post service
│   ├── profile.ts           # Profile service
│   └── ...
├── types/                   # TypeScript definitions
│   ├── auth.ts              # Auth types
│   ├── common.ts            # Shared Zod schemas
│   ├── prisma.ts            # Prisma output types
│   ├── profile.ts           # Profile types
│   └── ...
├── prisma/
│   └── schema.prisma        # Database schema
├── migrations/              # Database migrations
├── specs/                   # Feature specifications
└── public/                  # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x or higher
- [PostgreSQL](https://www.postgresql.org/) 14.x or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/sports_unit_v2.git
   cd sports_unit_v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sports_unit"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # AWS S3 (for media uploads)
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_S3_BUCKET="your-bucket-name"
   AWS_REGION="your-region"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Create database
   npm run create-db

   # Generate Prisma client
   npx prisma generate

   # Run migrations (if applicable)
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command               | Description              |
| --------------------- | ------------------------ |
| `npm run dev`         | Start development server |
| `npm run build`       | Build for production     |
| `npm run start`       | Start production server  |
| `npm run lint`        | Run ESLint               |
| `npm run create-db`   | Initialize database      |
| `npx prisma generate` | Generate Prisma client   |
| `npx prisma studio`   | Open Prisma Studio GUI   |

---

## 🏗 Architecture

### Design Patterns

- **Repository Pattern** - Services encapsulate database operations
- **API Route Handlers** - RESTful API endpoints in `/app/api`
- **Server Components** - Default rendering strategy for performance
- **Client Components** - Used only when client-side interactivity is required

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  API Route  │────▶│   Service   │────▶│   Prisma    │
│  Component  │     │   Handler   │     │    Layer    │     │   Client    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   ▼                   ▼                   ▼
       │            Zod Validation      Business Logic      PostgreSQL
       │
       └──────────────── TanStack Query (Client State) ───────────┘
```

### Type System

- **Input Validation**: Zod schemas for forms and API requests
- **Output Types**: Prisma-generated types mapped to UI types in `types/prisma.ts`
- **Shared Fields**: Reusable Zod field schemas in `types/common.ts`

---

## 🎨 Theming

The application uses a custom design system with semantic color tokens:

| Token           | Light Mode  | Dark Mode      | Usage                |
| --------------- | ----------- | -------------- | -------------------- |
| `--background`  | Light gray  | Dark blue      | Page background      |
| `--foreground`  | Dark blue   | Light          | Text color           |
| `--primary`     | Dark blue   | Medium blue    | Primary actions      |
| `--secondary`   | Medium blue | Dark secondary | Secondary actions    |
| `--accent`      | Teal green  | Teal green     | Accents & highlights |
| `--destructive` | Coral red   | Coral red      | Error states         |

Theme configuration is in `app/globals.css`. Dark mode is fully supported.

---

## 📚 API Documentation

### Authentication

| Endpoint                  | Method | Description        |
| ------------------------- | ------ | ------------------ |
| `/api/auth/register`      | POST   | Register new user  |
| `/api/auth/[...nextauth]` | \*     | NextAuth.js routes |

### Profile

| Endpoint                  | Method | Description              |
| ------------------------- | ------ | ------------------------ |
| `/api/profile`            | GET    | Get current user profile |
| `/api/profile`            | PATCH  | Update profile           |
| `/api/profile/[username]` | GET    | Get user by username     |

### Connections

| Endpoint                | Method | Description             |
| ----------------------- | ------ | ----------------------- |
| `/api/connections`      | GET    | List connections        |
| `/api/connections`      | POST   | Send connection request |
| `/api/connections/[id]` | PATCH  | Accept/decline request  |

### Posts

| Endpoint                   | Method   | Description      |
| -------------------------- | -------- | ---------------- |
| `/api/posts`               | GET      | Get feed posts   |
| `/api/posts`               | POST     | Create post      |
| `/api/posts/[id]/like`     | POST     | Like/unlike post |
| `/api/posts/[id]/comments` | GET/POST | Get/add comments |

### Discovery

| Endpoint         | Method | Description     |
| ---------------- | ------ | --------------- |
| `/api/discovery` | GET    | Search athletes |
| `/api/search`    | GET    | Global search   |

---

## 🤝 Contributing

### Development Guidelines

1. Follow the [Constitution v2.1.0](.github/copilot-instructions.md) principles
2. Use TypeScript with strict mode
3. Prefer `type` over `interface`
4. Use Zod for all input validation
5. Keep business logic in `/services`
6. Use Server Components by default
7. Follow mobile-first responsive design

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add watchlist export functionality
fix: resolve connection status update bug
docs: update API documentation
style: format profile components
refactor: extract validation utilities
test: add post service unit tests
chore: update dependencies
```

### Pull Request Process

1. Create a feature branch from `main`
2. Implement changes following guidelines
3. Run `npm run build` to validate
4. Run `npm run lint` to check code style
5. Submit PR with clear description
6. Request review from maintainers

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">

**Built with ❤️ by the Sports Unit Team**

</div>
