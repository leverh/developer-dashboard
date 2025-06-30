import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const GitHubCharts = ({ data }) => {
  if (!data || !data.repos || !data.events) {
    return (
      <div className="github-charts">
        <h2>GitHub Analytics</h2>
        <div className="no-data">
          <p>Connect GitHub to see visual analytics</p>
        </div>
      </div>
    )
  }

  const { repos, events, stats } = data

  // Process commit activity data
  const processCommitActivity = () => {
    const commitsByDate = {}
    
    events
      .filter(event => event.type === 'PushEvent')
      .forEach(event => {
        const date = new Date(event.created_at).toLocaleDateString()
        const commits = event.payload.commits?.length || 0
        commitsByDate[date] = (commitsByDate[date] || 0) + commits
      })

    return Object.entries(commitsByDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-14) // Last 14 days
      .map(([date, commits]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        commits
      }))
  }

  // Process language distribution
  const processLanguageData = () => {
    const languageStats = {}
    
    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
      }
    })

    return Object.entries(languageStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([language, count]) => ({
        name: language,
        value: count,
        percentage: Math.round((count / repos.length) * 100)
      }))
  }

  // Process repository stats
  const processRepoStats = () => {
    return repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map(repo => ({
        name: repo.name.length > 15 ? repo.name.substring(0, 15) + '...' : repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size: Math.round(repo.size / 1024) // Convert to MB
      }))
  }

  // Process activity timeline
  const processActivityTimeline = () => {
    const activityByWeek = {}
    
    events.forEach(event => {
      const week = getWeekStart(new Date(event.created_at))
      const weekKey = week.toLocaleDateString()
      
      if (!activityByWeek[weekKey]) {
        activityByWeek[weekKey] = {
          week: week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          commits: 0,
          issues: 0,
          prs: 0,
          total: 0
        }
      }
      
      activityByWeek[weekKey].total++
      
      switch (event.type) {
        case 'PushEvent':
          activityByWeek[weekKey].commits += event.payload.commits?.length || 0
          break
        case 'IssuesEvent':
          activityByWeek[weekKey].issues++
          break
        case 'PullRequestEvent':
          activityByWeek[weekKey].prs++
          break
      }
    })

    return Object.values(activityByWeek)
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8) // Last 8 weeks
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Color schemes
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']
  const languageColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'React': '#61dafb',
    'Vue': '#4FC08D'
  }

  const commitData = processCommitActivity()
  const languageData = processLanguageData()
  const repoData = processRepoStats()
  const activityData = processActivityTimeline()

  return (
    <div className="github-charts">
      <h2>GitHub Analytics</h2>
      
      <div className="charts-grid">
        {/* Commit Activity Chart */}
        <div className="chart-container">
          <h3>📊 Commit Activity (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="commits" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="chart-container">
          <h3>🔤 Language Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={languageColors[entry.name] || colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Repository Stats */}
        <div className="chart-container">
          <h3>⭐ Top Repositories by Stars</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={repoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stars" fill="#ffc658" />
              <Bar dataKey="forks" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="chart-container">
          <h3>📈 Weekly Activity Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="commits" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="issues" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="prs" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="chart-summary">
        <h3>📊 Summary Insights</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Most Used Language</h4>
            <p>{languageData[0]?.name || 'N/A'} ({languageData[0]?.percentage || 0}%)</p>
          </div>
          
          <div className="summary-item">
            <h4>Top Repository</h4>
            <p>{repoData[0]?.name || 'N/A'} ({repoData[0]?.stars || 0} ⭐)</p>
          </div>
          
          <div className="summary-item">
            <h4>Recent Commits</h4>
            <p>{commitData.reduce((sum, day) => sum + day.commits, 0)} in last 14 days</p>
          </div>
          
          <div className="summary-item">
            <h4>Activity Level</h4>
            <p>
              {stats.recentCommits > 10 ? 'Very Active 🔥' :
               stats.recentCommits > 5 ? 'Active 📈' :
               stats.recentCommits > 0 ? 'Moderate 📊' : 'Quiet 😴'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubCharts