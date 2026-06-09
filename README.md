# cs41 - Crowd Source FAQs

Community-driven Q&A platform for internship seekers.

## Features

- Ask and browse FAQs
- Community-driven question and answer platform
- AI-powered FAQ assistance
- Search and FAQ recommendations
- Insights and leaderboard pages
- React + Vite frontend
- Node.js backend with database support

## Project Structure

```text
client/     -> React frontend
server/     -> Node.js backend
research/   -> Research files and datasets
```

## Quick Start

Backend runs on:

```text
http://localhost:3001
```
Frontend runs on:

```text
http://localhost:5173
```


## Demo Accounts

All demo users have password: `demo1234`

- priya@university.edu
- rahul@institute.edu
- sneha@college.org
- arjun@tech.edu
- zara@university.edu

## Faculty Dashboard

Access the faculty dashboard at: http://localhost:5173/faculty

Faculty account:

- **Email:** `faculty@admin.com`
- **Password:** `demo1234`


### Backend Routes Summary

- `server/routes/faculty.js` — 48 faculty endpoints
- `server/routes/analytics.js` — 11 analytics endpoints (new router)
- `server/routes/settings.js` — 5 settings endpoints (new router)
- **Total: 64 faculty API endpoints**



## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- SQLite
- JavaScript

#  CS41  Crowd Source FAQs

A community-driven Q&A platform for internship seekers, specifically designed for the Vicharanashala Internship at IIT Ropar. This platform combines official FAQs with community-driven questions and answers, AI-powered insights, and a comprehensive faculty dashboard for content moderation and management.

##  Overview

Crowd Source FAQs is a full-stack web application that serves as a knowledge hub for internship-related queries. It merges officially curated FAQs from samagama.in with a community-driven Q&A system where users can ask questions, provide answers, and vote on content quality. The platform features AI-powered content analysis, moderation tools, and a comprehensive faculty dashboard for managing the internship program.

##  Features

### Core Functionality
- **Official FAQs**: Access to 127+ officially curated FAQs from Vicharanashala Internship program
- **Community Q&A**: Ask and answer internship-related questions
- **Voting System**: Upvote/downvote questions and answers to surface quality content
- **AI-Powered Analysis**: Automatic quality scoring, duplicate detection, and moderation flags
- **Search & Recommendations**: Advanced NLP-powered search with synonym expansion and BM25 ranking
- **Insights Dashboard**: Analytics and visualizations of platform activity

### Faculty Features
- **Content Moderation**: Review and manage community submissions
- **FAQ Promotion**: Elevate high-quality community questions to official FAQ status
- **SP Management**: Track and adjust Student Points (reputation system)
- **Moderation Queue**: Handle content flags and user reports
- **Analytics & Reporting**: Comprehensive metrics on platform usage and content quality
- **Audit Trail**: Complete history of all moderation actions
- **Settings Management**: Configure platform parameters and thresholds

### Technical Features
- **Modern Stack**: React 18 + Vite frontend, Node.js + Express backend
- **Database**: SQLite via sql.js (zero-configuration, pure JavaScript)
- **Authentication**: JWT-based auth with role-based access control
- **Real-time Updates**: Optimistic UI updates for voting and interactions
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Code splitting, lazy loading, and efficient caching

## Project Structure

```
Crowd_Source_faqs/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── data/           # Static data (official FAQs)
│   │   └── utils/          # Utility functions (NLP search, AI engine)
├── server/                 # Node.js backend (Express)
│   ├── db/                 # Database initialization and seeding
│   ├── middleware/         # Custom middleware (auth)
│   ├── routes/             # API route handlers
│   ├── utils/              # Utility functions (database, AI, migrations)
│   └── migrations/         # Database schema migrations
├── research/               # Research data and documents
│   ├── samagama_faq.json   # Official FAQs source data
│   └── Feature_Research.docx # Feature research documentation
├── memory/                 # Session memory files
├── .openclaw/              # Claude Code workspace configuration
├── AGENTS.md               # Agent workspace guidelines
├── HEARTBEAT.md            # Heartbeat configuration
├── IDENTITY.md             # Agent identity file
├── LICENSE                 # MIT License
├── README.md               # This file
├── SOUL.md                 # Agent soul/personality guidelines
├── SPEC.md                 # Detailed technical specification
├── TOOLS.md                # Tools and skills documentation
└── USER.md                 # User context
```

##  Technology Stack

### Frontend
- **React 18** with Hooks
- **Vite** for fast development and building
- **React Router v6** for client-side routing
- **Tailwind CSS v4** for utility-first styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Recharts** for data visualization
- **@xenova/transformers** for client-side NLP
- **Tesseract.js** for OCR capabilities
- **PDF.js Dist** for PDF rendering

### Backend
- **Node.js** runtime
- **Express.js** web framework
- **sql.js** - SQLite compiled to WebAssembly/JavaScript
- **bcryptjs** for password hashing
- **jsonwebtoken** for authentication
- **uuid** for unique ID generation
- **cors** for Cross-Origin Resource Sharing

### Development Tools
- **ESLint** for code linting
- **PostCSS** with Tailwind CSS
- **Vite plugins** for React support

##  System Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 4GB RAM recommended

##  Installation & Setup

### Prerequisites
Ensure you have Node.js and npm installed on your system.

### Backend Setup 
```bash
# Clone the repository
git clone https://github.com/apstomar640/Crowd_Source_faqs.git
cd Crowd_Source_faqs

# Install backend dependencies
cd server
npm install

# Initialize and seed the database
npm run seed

# Start the development server
npm run dev
```

The backend will start on `http://localhost:3001` (depends on your server seeded)

### Frontend Setup
```bash
# In a new terminal, navigate to the client directory
cd ../client
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`(depends on your server seeded)

### Production Build
```bash
# Build frontend for production
cd client
npm run build

# Build backend for production
cd ../server
npm run build

# Start production servers
# (In practice, you would use a process manager like PM2 or deploy to a hosting service)
```

## Database Schema

The application uses SQLite with the following key tables:

- **users**: Stores user information (interns, faculty, admins)
- **questions**: Stores questions/FAQs with status workflow
- **answers**: Stores answers to questions
- **votes**: Tracks upvotes/downvotes on questions and answers
- **content_flags**: Tracks moderation flags on content
- **faq_revision_log**: Audits all FAQ status changes
- **faq_ai_analysis**: Stores AI analysis results for questions
- **faq_tags**: Tagging system for categorizing content
- **sp_ledger**: Tracks Student Points transactions
- **analytics_***: Precomputed analytics tables for dashboard performance

## Authentication & Roles

The system implements role-based access control with three primary roles:

1. **Intern/Student**: Can ask questions, answer questions, vote, and earn Student Points
2. **Faculty**: Can moderate content, review submissions, manage SP, and access analytics
3. **Admin**: Has all faculty privileges plus user role management

Authentication is handled via JWT tokens stored in localStorage, with automatic token refresh capabilities.

##  Key Metrics & Analytics

The platform provides comprehensive analytics including:

- **KPI Dashboard**: Total FAQs, pending review, published content, moderation flags
- **FAQ Submission Metrics**: Daily/monthly submission trends, quality scores
- **Review Throughput**: Average review time, weekly volumes, AI usage statistics
- **Moderation Metrics**: Flag resolution rates, content removals, user warnings
- **SP Distribution**: Student Points statistics, leaderboards, anomaly detection
- **Weekly Activity**: Posting patterns by day of week
- **Heatmap Visualization**: Activity by hour and day

## Content Moderation Workflow

1. **Submission**: Users submit questions via `/community` or `/submit` pages
2. **Initial Review**: Content enters `pending_review` status automatically
3. **AI Analysis**: Automatic quality scoring, duplicate detection, and moderation flags
4. **Faculty Review**: Faculty members review content in the moderation queue
5. **Actions**: Faculty can:
   - **Publish**: Elevate to official FAQ status
   - **Reject**: Remove from public view with optional feedback
   - **Request Changes**: Send back for improvement
   - **Unpublish/Archive**: Remove from active rotation
   - **Merge**: Combine with existing similar FAQ
6. **Auto-Promotion**: Community questions with ≥10 net upvotes and ≥1 answer auto-promote to pending review
7. **Audit Trail**: All actions are logged with timestamps and reviewer information

## 💡 Student Points (SP) System

The SP system gamifies participation and rewards valuable contributions:

- **Asking Question**: +2 SP
- **Answering Question**: +5 SP
- **Answer Accepted**: +15 SP
- **Received Upvote**: +10 SP
- **Gave Upvote**: -1 SP (to discourage spam voting)
- **Best Answer Selected**: +10 SP
- **Question Published**: +3 SP
- **Valid Flag Review**: +5 SP
- **Manual Adjustments**: Faculty can add or deduct SP as needed
- **Account Frozen**: -50 SP penalty for policy violations

SP thresholds determine user privileges and appear on leaderboards.

## Use Cases

### For Internship Seekers
1. Find answers to common internship questions in the official FAQ section
2. Ask specific questions not covered in official documentation
3. Browse community questions to learn from others' experiences
4. Vote on helpful content to improve the knowledge base
5. Track your SP earnings and reputation in the community

### For Faculty & Administrators
1. Monitor incoming questions and identify trends
2. Moderate content to maintain quality standards
3. Promote valuable community questions to official status
4. Track student engagement and reward active participants
5. Generate reports for program improvement and accreditation
6. Manage user roles and permissions
7. Configure platform settings to align with program goals

### For Researchers
1. Analyze internship query patterns and trending topics
2. Study the effectiveness of community-driven knowledge platforms
3. Examine moderation workflows and community self-regulation
4. Investigate gamification effects on user engagement
5. Research natural language processing applications in educational contexts

## Security & Privacy

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control on all endpoints
- **Input Validation**: Comprehensive validation on all user inputs
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Prevention**: Proper escaping and content sanitization
- **CSRF Protection**: Same-site cookies and token validation where applicable
- **Rate Limiting**: Implemented on authentication endpoints
- **Data Minimization**: Only essential personal data stored
- **Privacy by Design**: Privacy considerations built into architecture

## Contributing

We welcome contributions to improve Crowd Source FAQs! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows:
- Existing code style and conventions
- Includes appropriate tests for new functionality
- Updates documentation as needed
- Passes linting checks (`npm run lint` in both client and server)


## Acknowledgments

- **Vicharanashala Lab for Education Design**, IIT Ropar for providing the official FAQ dataset
- **samagama.in** for hosting the original Vicharanashala Internship FAQ
- **All contributors** who have helped improve this platform
- **The open-source community** for the fantastic tools and libraries used

## 📞 Support

For questions, issues, or support requests:
- Visit the Issues tab on this GitHub repository
- Contact the maintainers through the provided channels
- Check the documentation in the `docs/` directory (if applicable)

---

## Repository

This repository contains the Crowd Source FAQs platform developed as part of the Vicharanashala internship project.

## License

Refer to the LICENSE file included in this repository.
