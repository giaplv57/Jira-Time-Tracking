# Jira Time Tracking Application

A modern, feature-rich time tracking application for Jira tickets built with React, TypeScript, and Tailwind CSS. Track your work time efficiently with an intuitive interface, real-time timer functionality, and seamless Jira integration.

![Jira Time Tracker](https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## Features

### Secure Authentication
- Personal Access Token (PAT) authentication with Jira
- Connection testing before authentication
- Session persistence with automatic restoration
- Secure credential management with logout functionality

### Advanced Time Tracking
- **One-click timer start** - Click any ticket row to begin tracking
- **Real-time timer display** with HH:MM:SS format
- **Smart task switching** - Automatic worklog prompts when switching between tasks
- **Pause/Resume functionality** for flexible time management
- **Stop tracking** with worklog creation
- **Compact timer widget** for always-visible time display

### Powerful Ticket Management
- **JQL Query Support** - Full Jira Query Language support for advanced filtering
- **Quick filter presets** - Pre-configured filters for common searches:
  - My Open Issues
  - Recently Updated
  - High Priority
  - In Progress
- **Customizable column display** - Show/hide columns as needed with persistence
- **Visual priority indicators** with color-coded flags
- **Status badges** with contextual colors
- **Issue type icons** for quick identification
- **Epic link display** with consistent color-coded badges
- **Priority-based sorting** (high to low)

### Worklog Creation
- **Auto-filled time entries** based on tracked time
- **Auto-calculated start time** from when timer began
- **Flexible time formats** - Support for hours, minutes, days:
  - `2h 30m` - 2 hours 30 minutes
  - `1.5h` - 1.5 hours
  - `90m` - 90 minutes
  - `1d 4h` - 1 day 4 hours
- **Rich description field** for detailed work notes
- **Drop work option** to discard tracked time without logging
- **Form validation** with error feedback

### Calendar View
- **Visual worklog history** across all tracked tickets
- **Event-based display** showing logged work
- **Time duration calculation** for each entry
- **Modal-based interface** for focused viewing

### Zen Mode
- **Distraction-free tracking** - Hide header for focused work
- **Toggle on/off** with a single click
- **Maximized workspace** for the ticket table

### Beautiful Design
- **Modern gradient UI** with glass-morphism effects
- **Responsive design** - Works on desktop, tablet, and mobile
- **Smooth animations** and micro-interactions
- **Apple-level design aesthetics** with attention to detail
- **Selected ticket highlighting** with visual emphasis

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Jira workspace with API access
- Personal Access Token from Jira

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira-time-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174`

### Jira Setup

1. **Generate a Personal Access Token**
   - Go to your Jira account settings
   - Navigate to Security > Create and manage API tokens
   - Create a new token and copy it securely

2. **Find your Jira endpoint**
   - Usually in the format: `https://yourcompany.atlassian.net` or your self-hosted Jira URL

3. **Connect the application**
   - Enter your PAT and endpoint in the welcome screen
   - Click "Connect to Jira" to authenticate
   - Your session will be saved for future visits

## Usage Guide

### Basic Workflow

1. **Enter JQL Query**
   - Click "Enter JQL" to open the query modal
   - Use quick filters or write custom JQL
   - Examples:
     - `assignee = currentUser() AND status != Done`
     - `project = MYPROJ AND priority = High`

2. **Start Time Tracking**
   - Click on any ticket row to start the timer
   - Timer appears with real-time updates
   - Selected ticket is highlighted with visual emphasis

3. **Switch Between Tasks**
   - Click another ticket while timer is running
   - Worklog modal appears automatically
   - Fill in work details and switch to new task

4. **Stop Tracking**
   - Click "Stop Tracking" button (appears when timer is active)
   - Complete worklog form to log your time
   - Or click "Drop Work" to discard without logging

5. **View Work History**
   - Click the calendar icon to view logged worklogs
   - See all your tracked time in calendar format

6. **Enable Zen Mode**
   - Toggle zen mode to hide the header
   - Focus purely on your ticket list and timer

### JQL Query Examples
```sql
-- My open issues
assignee = currentUser() AND status != Done

-- Recently updated tickets
updated >= -7d ORDER BY updated DESC

-- High priority items
priority = High AND status != Done

-- Specific project tickets
project = "MYPROJECT" AND status = "In Progress"

-- Issues in a specific epic
"Epic Link" = PROJ-123
```

### Column Customization
- Click the "Columns" button to show/hide table columns
- Available columns: Type, Key, Summary, Status, Priority, Epic, Time
- Required columns (Key, Summary, Time) cannot be hidden
- Settings persist across sessions

## Technical Stack

### Frontend
- **React 18.3** - Modern React with hooks
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework

### UI Components
- **Ant Design 5.26** - Enterprise UI components (tables, notifications)
- **Lucide React** - Beautiful, consistent icons
- **react-big-calendar** - Calendar component for worklog visualization
- **Moment.js** - Date/time manipulation

### Development Tools
- **ESLint 9** - Code linting with TypeScript support
- **PostCSS** - CSS processing with Autoprefixer
- **React Hooks ESLint Plugin** - React-specific linting

## Project Structure

```
src/
├── components/              # React UI components
│   ├── WelcomeScreen.tsx       # Authentication screen
│   ├── MainScreen.tsx          # Main application layout
│   ├── TicketTable.tsx         # Ticket display and timer controls
│   ├── JQLModal.tsx            # JQL query input modal
│   ├── WorklogModal.tsx        # Time logging modal
│   ├── WorklogCalendar.tsx     # Calendar view of worklogs
│   ├── ColumnSelector.tsx      # Column visibility controls
│   └── CompactTimerWidget.tsx  # Timer display widget
├── hooks/                   # Custom React hooks
│   ├── useSession.ts           # Session management and persistence
│   ├── useTicketData.ts        # Jira ticket data fetching
│   ├── useTicketTimer.ts       # Timer state and control logic
│   └── useWorklogData.ts       # Worklog data fetching
├── services/                # Business logic and API
│   ├── jiraApi.ts              # Jira REST API wrapper
│   └── sessionService.ts       # LocalStorage session management
├── types/                   # TypeScript type definitions
│   └── jira.ts                 # Jira-related types and interfaces
├── constants/               # Configuration constants
│   └── columnConfig.ts         # Default table column settings
├── utils/                   # Utility functions
│   ├── ticketHelpers.tsx       # Formatting, color, and icon utilities
│   └── errorHandler.ts         # Error handling utilities
├── App.tsx                  # Root application component
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

## Design Philosophy

This application follows **Apple-level design aesthetics** with:

- **Minimalist Interface** - Clean, uncluttered design
- **Consistent Typography** - Proper hierarchy and spacing
- **Thoughtful Animations** - Smooth transitions and micro-interactions
- **Accessible Colors** - High contrast ratios for readability
- **Responsive Layout** - Seamless experience across devices
- **Glass Morphism** - Modern backdrop blur effects
- **Gradient Accents** - Subtle color transitions

## Configuration

### Vite Configuration
The application is configured to run on port 5174 with a proxy to the Jira API:
- Dev server: `http://localhost:5174`
- API proxy: `/api/jira` -> Your Jira endpoint

### Customization
- Modify `tailwind.config.js` for theme customization
- Update `src/constants/columnConfig.ts` for default column settings
- Adjust animations and transitions in component CSS classes

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Jira API** - For providing robust ticket management
- **Ant Design** - For enterprise-grade UI components
- **Lucide Icons** - For beautiful, consistent iconography
- **Tailwind CSS** - For rapid UI development
- **React Team** - For the amazing framework

---

**Built for productive time tracking**
