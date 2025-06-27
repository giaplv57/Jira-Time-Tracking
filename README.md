# Jira Time Tracking Application

A beautiful, modern time tracking application for Jira tickets built with React, TypeScript, and Tailwind CSS. Track your work time efficiently with an intuitive interface and seamless Jira integration.

![Jira Time Tracker](https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🔐 **Secure Authentication**
- Personal Access Token (PAT) authentication
- Secure connection to your Jira workspace
- Easy credential management with reset functionality

### ⏱️ **Advanced Time Tracking**
- **One-click timer start** - Click any ticket to begin tracking
- **Real-time timer display** with hours:minutes:seconds format
- **Smart task switching** - Automatic worklog prompts when switching between tasks
- **Pause/Resume functionality** for flexible time management
- **Stop tracking** with worklog creation

### 🎯 **Powerful Ticket Management**
- **JQL Query Support** - Use Jira Query Language for advanced filtering
- **Quick filter presets** for common searches
- **Real-time ticket filtering** by summary, key, or status
- **Customizable column display** - Show/hide columns as needed
- **Visual priority indicators** with color-coded flags
- **Status badges** with contextual colors

### 📊 **Smart Worklog Creation**
- **Auto-filled time entries** based on tracked time
- **Flexible time formats** - Support for hours, minutes, days (2h 30m, 1.5h, 90m)
- **Date/time picker** with auto-population
- **Rich description field** for detailed work notes
- **Validation and error handling**

### 🎨 **Beautiful Design**
- **Modern gradient UI** with glass-morphism effects
- **Responsive design** - Works on desktop, tablet, and mobile
- **Smooth animations** and micro-interactions
- **Apple-level design aesthetics** with attention to detail
- **Dark/light theme support** with proper contrast ratios

## 🚀 Getting Started

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
   Navigate to `http://localhost:5173`

### Jira Setup

1. **Generate a Personal Access Token**
   - Go to your Jira account settings
   - Navigate to Security → Create and manage API tokens
   - Create a new token and copy it securely

2. **Find your Jira endpoint**
   - Usually in the format: `https://yourcompany.atlassian.net`

3. **Connect the application**
   - Enter your PAT and endpoint in the welcome screen
   - Click "Connect to Jira" to authenticate

## 📖 Usage Guide

### Basic Workflow

1. **Enter JQL Query**
   - Click "Enter JQL" to open the query modal
   - Use quick filters or write custom JQL
   - Examples:
     - `assignee = currentUser() AND status != Done`
     - `project = MYPROJ AND priority = High`

2. **Start Time Tracking**
   - Click on any ticket row to start the timer
   - Timer appears in the "Time" column with real-time updates
   - Selected ticket is highlighted with visual emphasis

3. **Switch Between Tasks**
   - Click another ticket while timer is running
   - Worklog modal appears automatically
   - Fill in work details and switch to new task

4. **Stop Tracking**
   - Click "Stop Tracking" button (appears when timer is active)
   - Complete worklog form to log your time
   - Timer stops completely

### Advanced Features

#### JQL Query Examples
```sql
-- My open issues
assignee = currentUser() AND status != Done

-- Recently updated tickets
updated >= -7d ORDER BY updated DESC

-- High priority items
priority = High AND status != Done

-- Specific project tickets
project = "MYPROJECT" AND status = "In Progress"
```

#### Time Format Examples
- `2h 30m` - 2 hours 30 minutes
- `1.5h` - 1.5 hours
- `90m` - 90 minutes
- `1d 4h` - 1 day 4 hours

#### Column Customization
- Click the "Columns" button to show/hide table columns
- Required columns (Ticket, Summary, Time) cannot be hidden
- Settings persist during your session

## 🛠️ Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Icons & UI
- **Lucide React** - Beautiful, consistent icons
- **Custom components** - Modular, reusable UI elements
- **Responsive design** - Mobile-first approach

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing with Autoprefixer

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── WelcomeScreen.tsx    # Authentication screen
│   ├── MainScreen.tsx       # Main application layout
│   ├── TicketTable.tsx      # Ticket display and timer logic
│   ├── JQLModal.tsx         # JQL query input modal
│   ├── WorklogModal.tsx     # Time logging modal
│   └── ColumnSelector.tsx   # Column visibility controls
├── types/               # TypeScript type definitions
│   └── jira.ts             # Jira-related types
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Design Philosophy

This application follows **Apple-level design aesthetics** with:

- **Minimalist Interface** - Clean, uncluttered design
- **Consistent Typography** - Proper hierarchy and spacing
- **Thoughtful Animations** - Smooth transitions and micro-interactions
- **Accessible Colors** - High contrast ratios for readability
- **Responsive Layout** - Seamless experience across devices
- **Glass Morphism** - Modern backdrop blur effects
- **Gradient Accents** - Subtle color transitions

## 🔧 Configuration

### Environment Variables
No environment variables required - all configuration is done through the UI.

### Customization
- Modify `tailwind.config.js` for theme customization
- Update color schemes in component files
- Adjust animations and transitions in CSS classes

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Jira API** - For providing robust ticket management
- **Lucide Icons** - For beautiful, consistent iconography
- **Tailwind CSS** - For rapid UI development
- **React Team** - For the amazing framework

---

**Built with ❤️ for productive time tracking**