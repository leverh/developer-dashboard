const NetlifyStatus = ({ data, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <div className="netlify-status">
        <h2>Netlify Deployments</h2>
        <div className="loading">Loading Netlify data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="netlify-status">
        <h2>Netlify Deployments</h2>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={onRefresh}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="netlify-status">
        <h2>Netlify Deployments</h2>
        <div className="no-data">
          <p>Connect your Netlify account to see deployment status</p>
          <p>Add your VITE_NETLIFY_TOKEN to your .env file</p>
        </div>
      </div>
    )
  }

  const { sites, stats } = data

  const getDeploymentStatus = (state) => {
    switch (state) {
      case 'ready': return { color: 'green', text: 'Ready', icon: '✅' }
      case 'building': return { color: 'blue', text: 'Building', icon: '🔄' }
      case 'error': return { color: 'red', text: 'Failed', icon: '❌' }
      case 'new': return { color: 'gray', text: 'New', icon: '⭕' }
      default: return { color: 'gray', text: state, icon: '❓' }
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const deployDate = new Date(dateString)
    const diffInMinutes = Math.floor((now - deployDate) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes}m ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="netlify-status">
      <div className="netlify-header">
        <h2>Netlify Deployments</h2>
        <button onClick={onRefresh} className="refresh-btn" title="Refresh Netlify data">
          🔄
        </button>
      </div>

      {/* Summary Stats */}
      <div className="deployment-stats">
        <div className="stat-card">
          <h3>Sites</h3>
          <p className="stat-number">{stats.totalSites}</p>
        </div>
        
        <div className="stat-card">
          <h3>Success Rate</h3>
          <p className="stat-number">{stats.deploymentSuccessRate}%</p>
        </div>
        
        <div className="stat-card">
          <h3>Forms</h3>
          <p className="stat-number">{stats.totalForms}</p>
        </div>
      </div>

      {/* Sites List */}
      <div className="sites-list">
        <h3>Active Sites</h3>
        {sites.length > 0 ? (
          <div className="sites-grid">
            {sites.map(site => {
              const latestDeploy = site.recent_deployments?.[0]
              const status = latestDeploy ? getDeploymentStatus(latestDeploy.state) : null
              
              return (
                <div key={site.id} className="site-card">
                  <div className="site-header">
                    <h4>
                      <a href={site.ssl_url || site.url} target="_blank" rel="noopener noreferrer">
                        {site.name}
                      </a>
                    </h4>
                    {status && (
                      <span className={`deploy-status status-${status.color}`}>
                        {status.icon} {status.text}
                      </span>
                    )}
                  </div>

                  <div className="site-info">
                    <p className="site-url">
                      <a href={site.ssl_url || site.url} target="_blank" rel="noopener noreferrer">
                        {(site.ssl_url || site.url).replace('https://', '')}
                      </a>
                    </p>
                    
                    {latestDeploy && (
                      <div className="deploy-info">
                        <span>Last deploy: {getTimeAgo(latestDeploy.created_at)}</span>
                        {latestDeploy.deploy_time && (
                          <span>Build time: {formatDuration(latestDeploy.deploy_time)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recent Deployments */}
                  {site.recent_deployments && site.recent_deployments.length > 0 && (
                    <div className="recent-deploys">
                      <p className="deploys-title">Recent Deployments:</p>
                      <div className="deploys-timeline">
                        {site.recent_deployments.slice(0, 3).map(deploy => {
                          const deployStatus = getDeploymentStatus(deploy.state)
                          return (
                            <div key={deploy.id} className="deploy-item">
                              <span className={`deploy-dot status-${deployStatus.color}`}>
                                {deployStatus.icon}
                              </span>
                              <span className="deploy-time">
                                {getTimeAgo(deploy.created_at)}
                              </span>
                              <span className="deploy-branch">
                                {deploy.branch || 'main'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Forms if available */}
                  {site.forms && site.forms.length > 0 && (
                    <div className="site-forms">
                      <span className="forms-count">
                        📝 {site.forms.length} form{site.forms.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className="site-actions">
                    <a 
                      href={`https://app.netlify.com/sites/${site.name}/overview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-link"
                    >
                      View in Netlify →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p>No sites found</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="netlify-actions">
        <a 
          href="https://app.netlify.com/sites"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open Netlify Dashboard
        </a>
        <a 
          href="https://app.netlify.com/start"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Deploy New Site
        </a>
      </div>
    </div>
  )
}

export default NetlifyStatus