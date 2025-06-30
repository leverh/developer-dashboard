import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { useDeployments } from '../hooks/useDeployments'

const DeploymentCharts = () => {
  const { netlify, vercel, hasNetlify, hasVercel } = useDeployments()

  if (!hasNetlify && !hasVercel) {
    return (
      <div className="deployment-charts">
        <h2>Deployment Analytics</h2>
        <div className="no-data">
          <p>Connect Netlify or Vercel to see deployment analytics</p>
        </div>
      </div>
    )
  }

  // Process deployment success rates
  const processSuccessRates = () => {
    const data = []
    
    if (hasNetlify && netlify.data) {
      data.push({
        platform: 'Netlify',
        success: netlify.data.stats.deploymentSuccessRate,
        failed: 100 - netlify.data.stats.deploymentSuccessRate,
        total: netlify.data.stats.totalDeployments
      })
    }
    
    if (hasVercel && vercel.data) {
      data.push({
        platform: 'Vercel',
        success: vercel.data.stats.deploymentSuccessRate,
        failed: 100 - vercel.data.stats.deploymentSuccessRate,
        total: vercel.data.stats.totalDeployments
      })
    }
    
    return data
  }

  // Process deployment timeline
  const processDeploymentTimeline = () => {
    const deploymentsByDate = {}
    
    // Netlify deployments
    if (hasNetlify && netlify.data?.sites) {
      netlify.data.sites.forEach(site => {
        site.recent_deployments?.forEach(deploy => {
          const date = new Date(deploy.created_at).toLocaleDateString()
          if (!deploymentsByDate[date]) {
            deploymentsByDate[date] = { date, netlify: 0, vercel: 0, total: 0 }
          }
          deploymentsByDate[date].netlify++
          deploymentsByDate[date].total++
        })
      })
    }
    
    // Vercel deployments
    if (hasVercel && vercel.data?.deployments) {
      vercel.data.deployments.forEach(deploy => {
        const date = new Date(deploy.createdAt).toLocaleDateString()
        if (!deploymentsByDate[date]) {
          deploymentsByDate[date] = { date, netlify: 0, vercel: 0, total: 0 }
        }
        deploymentsByDate[date].vercel++
        deploymentsByDate[date].total++
      })
    }
    
    return Object.values(deploymentsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14) // Last 14 days
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
  }

  // Process build times (estimated from available data)
  const processBuildTimes = () => {
    const buildData = []
    
    if (hasNetlify && netlify.data?.sites) {
      netlify.data.sites.forEach(site => {
        if (site.recent_deployments?.[0]?.deploy_time) {
          buildData.push({
            site: site.name,
            platform: 'Netlify',
            buildTime: site.recent_deployments[0].deploy_time,
            status: site.recent_deployments[0].state
          })
        }
      })
    }
    
    if (hasVercel && vercel.data?.deployments) {
      vercel.data.deployments.slice(0, 5).forEach(deploy => {
        if (deploy.ready && deploy.createdAt) {
          const buildTime = Math.floor((new Date(deploy.ready) - new Date(deploy.createdAt)) / 1000)
          buildData.push({
            site: deploy.name,
            platform: 'Vercel',
            buildTime: buildTime,
            status: deploy.state
          })
        }
      })
    }
    
    return buildData
      .filter(item => item.buildTime > 0 && item.buildTime < 3600) // Filter realistic build times
      .sort((a, b) => b.buildTime - a.buildTime)
      .slice(0, 10)
  }

  // Process platform distribution
  const processPlatformDistribution = () => {
    const data = []
    
    if (hasNetlify && netlify.data) {
      data.push({
        name: 'Netlify',
        sites: netlify.data.stats.totalSites,
        deployments: netlify.data.stats.totalDeployments,
        color: '#00ad9f'
      })
    }
    
    if (hasVercel && vercel.data) {
      data.push({
        name: 'Vercel',
        sites: vercel.data.stats.totalProjects,
        deployments: vercel.data.stats.totalDeployments,
        color: '#000000'
      })
    }
    
    return data
  }

  const successData = processSuccessRates()
  const timelineData = processDeploymentTimeline()
  const buildTimeData = processBuildTimes()
  const platformData = processPlatformDistribution()

  const colors = ['#00ad9f', '#000000', '#8884d8', '#82ca9d']

  return (
    <div className="deployment-charts">
      <h2>📊 Deployment Analytics</h2>
      
      <div className="charts-grid">
        {/* Success Rate Comparison */}
        <div className="chart-container">
          <h3>✅ Deployment Success Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="success" fill="#82ca9d" name="Success Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="chart-container">
          <h3>🚀 Sites by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, sites }) => `${name}: ${sites}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sites"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Timeline */}
        {timelineData.length > 0 && (
          <div className="chart-container">
            <h3>📈 Deployment Timeline (14 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {hasNetlify && <Line type="monotone" dataKey="netlify" stroke="#00ad9f" strokeWidth={2} />}
                {hasVercel && <Line type="monotone" dataKey="vercel" stroke="#000000" strokeWidth={2} />}
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Build Times */}
        {buildTimeData.length > 0 && (
          <div className="chart-container">
            <h3>⏱️ Build Times Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildTimeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="site" width={100} />
                <Tooltip formatter={(value) => `${Math.floor(value / 60)}m ${value % 60}s`} />
                <Legend />
                <Bar dataKey="buildTime" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Deployment Insights */}
      <div className="deployment-insights">
        <h3>💡 Deployment Insights</h3>
        <div className="insights-grid">
          {successData.map(platform => (
            <div key={platform.platform} className="insight-card">
              <h4>{platform.platform} Performance</h4>
              <p>
                {platform.success >= 95 ? '🟢 Excellent' :
                 platform.success >= 85 ? '🟡 Good' : '🔴 Needs Attention'}
              </p>
              <p>{platform.success}% success rate ({platform.total} deployments)</p>
            </div>
          ))}
          
          {buildTimeData.length > 0 && (
            <div className="insight-card">
              <h4>⚡ Build Performance</h4>
              <p>
                Average build time: {Math.round(buildTimeData.reduce((sum, item) => sum + item.buildTime, 0) / buildTimeData.length / 60)}m
              </p>
              <p>
                {buildTimeData.reduce((sum, item) => sum + item.buildTime, 0) / buildTimeData.length < 300 ? 
                  'Fast builds! 🚀' : 'Consider optimizing build times ⚡'}
              </p>
            </div>
          )}
          
          <div className="insight-card">
            <h4>📊 Platform Summary</h4>
            <p>
              Total sites: {platformData.reduce((sum, p) => sum + p.sites, 0)}<br/>
              Total deployments: {platformData.reduce((sum, p) => sum + p.deployments, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeploymentCharts