# Developer Dashboard

A comprehensive developer dashboard that aggregates and visualizes your development activity across multiple platforms. Built with React, Vite, and CSS. This dashboard provides real-time insights into your GitHub activity, deployment status, productivity metrics, etc.

![Developer Dashboard](https://img.shields.io/badge/React-19.0+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

### 🎯 **Core Functionality**
- **GitHub Integration** - Real-time repository stats, commit activity, and project analytics
- **Deployment Tracking** - Monitor Netlify and Vercel deployments with build status
- **Analytics** - Interactive charts and productivity metrics
- **Dark/Light Theme** - Theme system with system preference detection
- **Responsive Design** - Works on desktop, tablet, and mobile

### 📊 **Data Visualizations**
- **Commit Activity Timeline** - Track your coding patterns over time
- **Language Distribution** - See your most-used programming languages
- **Repository Analytics** - Stars, forks, and repository performance
- **Deployment Success Rates** - Monitor your deployment health
- **Productivity Radar Chart** - 6-dimension productivity scoring
- **Achievement System** - Unlock badges based on your activity

### 🎨 **User Experience**
- **Modern Design** - Clean interface with animations
- **Smart Navigation** - Scroll-to-top with progress indicator
- **Theme System** - Light, dark, and system-follow modes
- **Keyboard Shortcuts** - Power-user friendly navigation
- **Accessibility** - Full keyboard navigation and screen reader support

## Tech Stack

- **Frontend**: React 19+
- **Build Tool**: Vite for lightning-fast development
- **Styling**: CSS with CSS Variables and Grid/Flexbox. No Bootstrap/Tailwind here.
- **Charts**: Recharts for data visualizations
- **APIs**: GitHub REST API, Netlify API, Vercel API
- **Storage**: LocalStorage for preferences and caching

## Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Git for version control

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/developer-dashboard.git
cd developer-dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Required - Your GitHub username
VITE_GITHUB_USERNAME=your-github-username

# Optional - API Tokens for full usage of features
VITE_NETLIFY_TOKEN=your-netlify-personal-access-token
VITE_VERCEL_TOKEN=your-vercel-api-token

# Optional - App Configuration
VITE_APP_NAME=Developer Dashboard
VITE_APP_VERSION=1.0.0
```

### 4. Get API Tokens (Optional but Recommended)

#### GitHub (Public data - no token needed)
The dashboard works with public GitHub data without authentication.

#### Netlify Personal Access Token
1. Go to [Netlify Personal Access Tokens](https://app.netlify.com/user/applications#personal-access-tokens)
2. Click "New access token"
3. Name it "Developer Dashboard"
4. Copy the token to your `.env` file

#### Vercel API Token
1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "Developer Dashboard"
4. Copy the token to your `.env` file

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 6. **Important**
**DON'T FORGET TO ADD THE MODIFIED `.env` FILE TO YOUR `.gitignore` FILE**

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

## 📁 Project Structure

```
developer-dashboard/
├── public/                 # Static assets
│   ├── index.html
│   └── vite.svg
├── src/
│   ├── components/         # React components
│   │   ├── GitHubStats.jsx
│   │   ├── ProfileOverview.jsx
│   │   ├── ProjectsList.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── DeploymentOverview.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── GitHubCharts.jsx
│   │   ├── DeploymentCharts.jsx
│   │   ├── ProductivityMetrics.jsx
│   │   ├── NetlifyStatus.jsx
│   │   ├── VercelStatus.jsx
│   │   ├── SimpleThemeToggle.jsx
│   │   └── SimpleScrollToTop.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useGitHub.js
│   │   ├── useDeployments.js
│   │   └── useTheme.js
│   ├── services/           # API services
│   │   ├── githubApi.js
│   │   ├── netlifyApi.js
│   │   ├── vercelApi.js
│   │   └── apiConfig.js
│   ├── styles/             # CSS files
│   │   ├── App.css
│   │   ├── Components.css
│   │   ├── Analytics.css
│   │   ├── Themes.css
│   │   └── ScrollNavigation.css
│   ├── utils/              # Utility functions
│   │   └── dataUtils.js
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GITHUB_USERNAME` | Yes | Your GitHub username for fetching repositories and activity |
| `VITE_NETLIFY_TOKEN` | No | Personal access token for Netlify deployment data |
| `VITE_VERCEL_TOKEN` | No | API token for Vercel deployment data |
| `VITE_APP_NAME` | No | Custom name for your dashboard (default: "Developer Dashboard") |
| `VITE_APP_VERSION` | No | Version number for your dashboard (default: "1.0.0") |

### API Rate Limits - At The Time Of Deployment

- **GitHub**: 60 requests/hour without authentication, 5000/hour with token
- **Netlify**: 500 requests/hour with personal access token
- **Vercel**: 100 requests/hour with API token

## Customization

### Themes
The dashboard includes a theme system:
- **Light Mode**: Bright interface
- **Dark Mode**: For those who prefer
- **System Mode**: Automatically follows your OS preference

But since these are all variables, it's easy to modify to your own color schemes.

### Styling
Customize the appearance by modifying CSS variables in `src/styles/Themes.css`:

```css
:root {
  --primary-500: #3b82f6;        /* Primary color */
  --secondary-500: #64748b;      /* Secondary color */
  --success-500: #22c55e;        /* Success color */
  --warning-500: #f59e0b;        /* Warning color */
  --error-500: #ef4444;          /* Error color */
}
```

## Features You Never Knew You Needed!

### GitHub Integration
- Repository statistics and metrics
- Commit activity and contribution patterns
- Language distribution analysis
- Star and fork tracking
- Recent activity timeline

### Deployment Monitoring
- **Netlify**: Site status, build history, form submissions
- **Vercel**: Project deployments, build times, success rates
- Combined analytics across platforms

### Analytics Dashboard
- **GitHub Analytics**: Commit patterns, language usage, repository performance
- **Deployment Analytics**: Success rates, build times, platform comparison
- **Productivity Metrics**: 6-dimension scoring with personalized insights

### Achievement System
Unlock achievements based on your activity:
- 🏆 **Code Warrior**: 20+ commits this week
- ⭐ **Star Collector**: 100+ total stars
- 🌟 **Polyglot**: 5+ programming languages
- 🤝 **Team Player**: 5+ pull requests
- 🚀 **Deploy Master**: 5+ sites deployed

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build your project: `npm run build`
2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Or connect your GitHub repository for automatic deployments

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## Privacy & Security

- **No Data Storage**: All data is fetched in real-time from APIs
- **Local Preferences**: Theme and settings stored locally only
- **API Security**: Tokens are stored in environment variables
- **No Tracking**: No analytics or tracking services included

## 📝 License

This project is licensed under the MIT License. Copy or share - I really don't care 🖖✌️

## 🙏 Acknowledgments

React, Vite, Recharts, GitHub Netlify and Vercel API's.

## Attributions

Favicon by [Vector Bazar - Flaticon](https://www.flaticon.com/free-icons/layout)


## 🌟 Show Your Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 📢 Sharing with fellow developers

---

## Links
- **Deployed Version**: [Developer Dashboard](https://pixelsummit-storybook.netlify.app/) 
- **Portfolio Website**: [PixelSummit](https://pixelsummit.dev/)
- **GitHub**: [GitHub](https://github.com/leverh/developer-dashboard)
- **Email**: contact@pixelsummit.dev