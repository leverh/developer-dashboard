// Date utilities
export const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  return date.toLocaleDateString()
}

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return 'N/A'
  
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export const getDateRange = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}

// GitHub data processing
export const processGitHubEvents = (events) => {
  if (!events || !Array.isArray(events)) return []
  
  return events.map(event => ({
    ...event,
    timeAgo: getTimeAgo(event.created_at),
    type: event.type.replace('Event', ''),
    commitCount: event.type === 'PushEvent' ? event.payload.commits?.length || 0 : 0
  }))
}

export const groupEventsByDate = (events, days = 14) => {
  const { start } = getDateRange(days)
  const groupedData = {}
  
  events
    .filter(event => new Date(event.created_at) >= start)
    .forEach(event => {
      const date = new Date(event.created_at).toLocaleDateString()
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          commits: 0,
          issues: 0,
          prs: 0,
          total: 0
        }
      }
      
      groupedData[date].total++
      
      switch (event.type) {
        case 'PushEvent':
          groupedData[date].commits += event.payload.commits?.length || 0
          break
        case 'IssuesEvent':
          groupedData[date].issues++
          break
        case 'PullRequestEvent':
          groupedData[date].prs++
          break
      }
    })
  
  return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date))
}

export const calculateLanguageStats = (repos) => {
  if (!repos || !Array.isArray(repos)) return []
  
  const languageCount = {}
  const languageStars = {}
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
      languageStars[repo.language] = (languageStars[repo.language] || 0) + repo.stargazers_count
    }
  })
  
  return Object.entries(languageCount)
    .map(([language, count]) => ({
      name: language,
      repositories: count,
      stars: languageStars[language],
      percentage: Math.round((count / repos.length) * 100)
    }))
    .sort((a, b) => b.repositories - a.repositories)
}

export const calculateRepoMetrics = (repos) => {
  if (!repos || !Array.isArray(repos)) return {}
  
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)
  const totalSize = repos.reduce((sum, repo) => sum + repo.size, 0)
  
  const languages = new Set(repos.filter(r => r.language).map(r => r.language))
  const originalRepos = repos.filter(r => !r.fork)
  const activeRepos = repos.filter(r => {
    const lastUpdate = new Date(r.updated_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastUpdate >= thirtyDaysAgo
  })
  
  return {
    total: repos.length,
    original: originalRepos.length,
    forked: repos.length - originalRepos.length,
    active: activeRepos.length,
    totalStars,
    totalForks,
    totalSize: Math.round(totalSize / 1024), // Convert to MB
    languageCount: languages.size,
    averageStars: Math.round(totalStars / repos.length) || 0
  }
}

// Deployment data processing
export const processDeploymentData = (deployments, platform = 'netlify') => {
  if (!deployments || !Array.isArray(deployments)) return []
  
  return deployments.map(deployment => {
    const createdAt = platform === 'netlify' ? deployment.created_at : deployment.createdAt
    const state = platform === 'netlify' ? deployment.state : deployment.state
    
    return {
      ...deployment,
      timeAgo: getTimeAgo(createdAt),
      status: normalizeDeploymentStatus(state, platform),
      buildTime: calculateBuildTime(deployment, platform)
    }
  })
}

export const normalizeDeploymentStatus = (state, platform) => {
  const statusMap = {
    netlify: {
      'ready': { color: 'green', text: 'Ready', icon: '✅' },
      'building': { color: 'blue', text: 'Building', icon: '🔄' },
      'error': { color: 'red', text: 'Failed', icon: '❌' },
      'new': { color: 'gray', text: 'New', icon: '⭕' }
    },
    vercel: {
      'READY': { color: 'green', text: 'Ready', icon: '✅' },
      'BUILDING': { color: 'blue', text: 'Building', icon: '🔄' },
      'ERROR': { color: 'red', text: 'Failed', icon: '❌' },
      'CANCELED': { color: 'orange', text: 'Canceled', icon: '🚫' },
      'QUEUED': { color: 'gray', text: 'Queued', icon: '⏳' }
    }
  }
  
  return statusMap[platform]?.[state] || { color: 'gray', text: state, icon: '❓' }
}

export const calculateBuildTime = (deployment, platform) => {
  if (platform === 'netlify') {
    return deployment.deploy_time || null
  } else if (platform === 'vercel') {
    if (deployment.ready && deployment.createdAt) {
      return Math.floor((new Date(deployment.ready) - new Date(deployment.createdAt)) / 1000)
    }
  }
  return null
}

// Productivity calculations
export const calculateProductivityScore = (githubData, deploymentData = {}) => {
  if (!githubData) return 0
  
  const { stats, events, repos } = githubData
  
  // Weighted scoring system
  const weights = {
    commits: 0.3,
    projects: 0.2,
    collaboration: 0.2,
    learning: 0.15,
    deployment: 0.15
  }
  
  // Individual scores (0-100)
  const commitScore = Math.min(100, stats.recentCommits * 5)
  const projectScore = Math.min(100, repos.length * 3 + stats.totalStars * 0.5)
  const collaborationScore = Math.min(100, 
    events.filter(e => e.type === 'IssuesEvent').length * 5 +
    events.filter(e => e.type === 'PullRequestEvent').length * 8 +
    stats.followers
  )
  const learningScore = Math.min(100, 
    stats.languagesCount * 10 +
    events.filter(e => e.type === 'WatchEvent').length * 2
  )
  const deploymentScore = Math.min(100, 
    (deploymentData.totalSites || 0) * 8 +
    (deploymentData.successRate || 50)
  )
  
  // Calculate weighted average
  return Math.round(
    commitScore * weights.commits +
    projectScore * weights.projects +
    collaborationScore * weights.collaboration +
    learningScore * weights.learning +
    deploymentScore * weights.deployment
  )
}

// Export utilities
export const exportToCSV = (data, filename) => {
  if (!data || !Array.isArray(data)) return
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => Object.values(row).join(','))
  const csvContent = [headers, ...rows].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.click()
  
  window.URL.revokeObjectURL(url)
}

// Color utilities for charts
export const getLanguageColor = (language) => {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'React': '#61dafb',
    'Vue': '#4FC08D',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45'
  }
  
  return colors[language] || '#8884d8'
}

export const generateColorPalette = (count) => {
  const baseColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }
  
  // Generate additional colors if needed
  const additionalColors = []
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360 // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`)
  }
  
  return [...baseColors, ...additionalColors]
}