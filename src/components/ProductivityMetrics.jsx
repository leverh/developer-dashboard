import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { useDeployments } from '../hooks/useDeployments'

const ProductivityMetrics = ({ githubData }) => {
  const { netlify, vercel, hasNetlify, hasVercel } = useDeployments()

  // Calculate productivity scores
  const calculateProductivityScore = () => {
    if (!githubData) return null

    const { stats, events, repos } = githubData

    // Code Activity Score (0-100)
    const codeActivityScore = Math.min(100, (stats.recentCommits * 5) + (events.filter(e => e.type === 'PushEvent').length * 2))

    // Project Management Score (0-100)
    const projectScore = Math.min(100, (repos.length * 3) + (stats.totalStars * 2))

    // Collaboration Score (0-100)
    const collaborationScore = Math.min(100, 
      (events.filter(e => e.type === 'IssuesEvent').length * 5) +
      (events.filter(e => e.type === 'PullRequestEvent').length * 8) +
      (stats.followers * 2)
    )

    // Learning Score (0-100)
    const learningScore = Math.min(100, 
      (stats.languagesCount * 8) +
      (events.filter(e => e.type === 'WatchEvent').length * 3) +
      (events.filter(e => e.type === 'ForkEvent').length * 5)
    )

    // Deployment Score (0-100)
    let deploymentScore = 50 // Base score
    if (hasNetlify && netlify.data) {
      deploymentScore += netlify.data.stats.totalSites * 5
      deploymentScore += netlify.data.stats.deploymentSuccessRate * 0.3
    }
    if (hasVercel && vercel.data) {
      deploymentScore += vercel.data.stats.totalProjects * 5
      deploymentScore += vercel.data.stats.deploymentSuccessRate * 0.3
    }
    deploymentScore = Math.min(100, deploymentScore)

    // Consistency Score (0-100)
    const consistencyScore = calculateConsistencyScore(events)

    return [
      { subject: 'Code Activity', score: Math.round(codeActivityScore), fullMark: 100 },
      { subject: 'Project Management', score: Math.round(projectScore), fullMark: 100 },
      { subject: 'Collaboration', score: Math.round(collaborationScore), fullMark: 100 },
      { subject: 'Learning', score: Math.round(learningScore), fullMark: 100 },
      { subject: 'Deployment', score: Math.round(deploymentScore), fullMark: 100 },
      { subject: 'Consistency', score: Math.round(consistencyScore), fullMark: 100 }
    ]
  }

  const calculateConsistencyScore = (events) => {
    if (!events || events.length === 0) return 0

    // Group events by day
    const eventsByDay = {}
    events.forEach(event => {
      const day = new Date(event.created_at).toDateString()
      eventsByDay[day] = (eventsByDay[day] || 0) + 1
    })

    const activeDays = Object.keys(eventsByDay).length
    const totalDays = Math.max(1, Math.floor((new Date() - new Date(events[events.length - 1].created_at)) / (1000 * 60 * 60 * 24)))
    
    return Math.min(100, (activeDays / Math.min(totalDays, 30)) * 100) // Last 30 days
  }

  // Calculate weekly productivity trends
  const calculateWeeklyTrends = () => {
    if (!githubData?.events) return []

    const weeklyData = {}
    
    githubData.events.forEach(event => {
      const week = getWeekStart(new Date(event.created_at))
      const weekKey = week.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          commits: 0,
          issues: 0,
          prs: 0,
          productivity: 0
        }
      }
      
      switch (event.type) {
        case 'PushEvent':
          weeklyData[weekKey].commits += event.payload.commits?.length || 0
          weeklyData[weekKey].productivity += (event.payload.commits?.length || 0) * 2
          break
        case 'IssuesEvent':
          weeklyData[weekKey].issues++
          weeklyData[weekKey].productivity += 3
          break
        case 'PullRequestEvent':
          weeklyData[weekKey].prs++
          weeklyData[weekKey].productivity += 5
          break
      }
    })

    return Object.values(weeklyData)
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8) // Last 8 weeks
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Calculate daily activity patterns
  const calculateDailyPatterns = () => {
    if (!githubData?.events) return []

    const hourlyActivity = Array(24).fill(0)
    
    githubData.events.forEach(event => {
      const hour = new Date(event.created_at).getHours()
      hourlyActivity[hour]++
    })

    return hourlyActivity.map((activity, hour) => ({
      hour: `${hour}:00`,
      activity,
      period: hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
    }))
  }

  // Calculate achievement metrics
  const calculateAchievements = () => {
    if (!githubData) return []

    const { stats, repos, events } = githubData
    const achievements = []

    // Code achievements
    if (stats.recentCommits >= 20) achievements.push({ title: 'Code Warrior', desc: '20+ commits this week', icon: '⚔️' })
    if (stats.totalStars >= 100) achievements.push({ title: 'Star Collector', desc: '100+ total stars', icon: '⭐' })
    if (stats.languagesCount >= 5) achievements.push({ title: 'Polyglot', desc: '5+ programming languages', icon: '🌟' })
    
    // Collaboration achievements
    const prs = events.filter(e => e.type === 'PullRequestEvent').length
    if (prs >= 5) achievements.push({ title: 'Team Player', desc: '5+ pull requests', icon: '🤝' })
    
    // Deployment achievements
    if (hasNetlify && netlify.data?.stats.totalSites >= 5) {
      achievements.push({ title: 'Deploy Master', desc: '5+ sites on Netlify', icon: '🚀' })
    }
    if (hasVercel && vercel.data?.stats.totalProjects >= 5) {
      achievements.push({ title: 'Vercel Pro', desc: '5+ projects on Vercel', icon: '▲' })
    }

    // Consistency achievements
    const activeDays = new Set(events.map(e => new Date(e.created_at).toDateString())).size
    if (activeDays >= 10) achievements.push({ title: 'Consistent Coder', desc: '10+ active days', icon: '📅' })

    return achievements
  }

  const productivityData = calculateProductivityScore()
  const weeklyTrends = calculateWeeklyTrends()
  const dailyPatterns = calculateDailyPatterns()
  const achievements = calculateAchievements()

  if (!githubData) {
    return (
      <div className="productivity-metrics">
        <h2>Productivity Metrics</h2>
        <div className="no-data">
          <p>Connect GitHub to see productivity analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="productivity-metrics">
      <h2>⚡ Productivity Metrics</h2>

      <div className="metrics-grid">
        {/* Productivity Radar Chart */}
        <div className="chart-container large">
          <h3>🎯 Productivity Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={productivityData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Productivity Score"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="radar-summary">
            <p>Overall Score: <strong>{Math.round(productivityData.reduce((sum, item) => sum + item.score, 0) / productivityData.length)}/100</strong></p>
          </div>
        </div>

        {/* Weekly Productivity Trends */}
        <div className="chart-container">
          <h3>📈 Weekly Productivity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="productivity" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="commits" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity Patterns */}
        <div className="chart-container">
          <h3>🕐 Daily Activity Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" interval={2} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Breakdown */}
        <div className="chart-container">
          <h3>📊 Productivity Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="subject" width={120} />
              <Tooltip />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h3>🏆 Achievements</h3>
        <div className="achievements-grid">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.desc}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-achievements">
              <p>Keep coding to unlock achievements! 🎯</p>
            </div>
          )}
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="productivity-insights">
        <h3>💡 Productivity Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🌟 Strongest Area</h4>
            <p>{productivityData.reduce((max, item) => item.score > max.score ? item : max, productivityData[0]).subject}</p>
          </div>
          
          <div className="insight-card">
            <h4>📈 Growth Opportunity</h4>
            <p>{productivityData.reduce((min, item) => item.score < min.score ? item : min, productivityData[0]).subject}</p>
          </div>
          
          <div className="insight-card">
            <h4>⏰ Peak Hours</h4>
            <p>
              {dailyPatterns.reduce((max, item) => item.activity > max.activity ? item : max, dailyPatterns[0])?.period || 'N/A'}
            </p>
          </div>
          
          <div className="insight-card">
            <h4>🔥 Streak</h4>
            <p>
              {new Set(githubData.events.slice(0, 7).map(e => new Date(e.created_at).toDateString())).size} active days this week
            </p>
          </div>
        </div>
      </div>

      {/* Productivity Goals */}
      <div className="productivity-goals">
        <h3>🎯 Suggested Goals</h3>
        <div className="goals-list">
          {productivityData.filter(item => item.score < 70).map(item => (
            <div key={item.subject} className="goal-item">
              <h4>Improve {item.subject}</h4>
              <p>Current score: {item.score}/100</p>
              <div className="goal-suggestions">
                {item.subject === 'Code Activity' && <span>💡 Try to commit code daily</span>}
                {item.subject === 'Collaboration' && <span>💡 Engage more with issues and PRs</span>}
                {item.subject === 'Learning' && <span>💡 Explore new programming languages</span>}
                {item.subject === 'Deployment' && <span>💡 Deploy more projects to showcase your work</span>}
                {item.subject === 'Consistency' && <span>💡 Code regularly, even if just small commits</span>}
              </div>
            </div>
          ))}
          {productivityData.every(item => item.score >= 70) && (
            <div className="goal-item success">
              <h4>🎉 Great Job!</h4>
              <p>All your productivity metrics are strong. Keep up the excellent work!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductivityMetrics;