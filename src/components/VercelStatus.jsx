const VercelStatus = ({ data, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <div className="vercel-status">
        <h2>Vercel Deployments</h2>
        <div className="loading">Loading Vercel data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="vercel-status">
        <h2>Vercel Deployments</h2>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={onRefresh}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="vercel-status">
        <h2>Vercel Deployments</h2>
        <div className="no-data">
          <p>Connect your Vercel account to see deployment status</p>
          <p>Add your VITE_VERCEL_TOKEN to your .env file</p>
        </div>
      </div>
    )
  }

  const { projects, deployments, stats, user } = data

  const getDeploymentStatus = (state) => {
    switch (state) {
      case 'READY': return { color: 'green', text: 'Ready', icon: '✅' }
      case 'BUILDING': return { color: 'blue', text: 'Building', icon: '🔄' }
      case 'ERROR': return { color: 'red', text: 'Failed', icon: '❌' }
      case 'CANCELED': return { color: 'orange', text: 'Canceled', icon: '🚫' }
      case 'QUEUED': return { color: 'gray', text: 'Queued', icon: '⏳' }
      default: return { color: 'gray', text: state, icon: '❓' }
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const deployDate = new Date(timestamp)
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

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const duration = Math.floor((new Date(end) - new Date(start)) / 1000)
    if (duration < 60) return `${duration}s`
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="vercel-status">
      <div className="vercel-header">
        <h2>Vercel Deployments</h2>
        <button onClick={onRefresh} className="refresh-btn" title="Refresh Vercel data">
          🔄
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="user-info">
          <div className="user-avatar">
            <img src={user.avatar} alt={user.name || user.username} width="40" height="40" />
          </div>
          <div className="user-details">
            <h3>{user.name || user.username}</h3>
            <p>{user.email}</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="deployment-stats">
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
        </div>
        
        <div className="stat-card">
          <h3>Success Rate</h3>
          <p className="stat-number">{stats.deploymentSuccessRate}%</p>
        </div>
        
        <div className="stat-card">
          <h3>Deployments</h3>
          <p className="stat-number">{stats.totalDeployments}</p>
        </div>

        <div className="stat-card">
          <h3>Domains</h3>
          <p className="stat-number">{stats.totalDomains}</p>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="recent-deployments">
        <h3>Recent Deployments</h3>
        {deployments.length > 0 ? (
          <div className="deployments-list">
            {deployments.slice(0, 5).map(deployment => {
              const status = getDeploymentStatus(deployment.state)
              return (
                <div key={deployment.uid} className="deployment-item">
                  <div className="deployment-status">
                    <span className={`status-indicator status-${status.color}`}>
                      {status.icon}
                    </span>
                    <span className="status-text">{status.text}</span>
                  </div>
                  
                  <div className="deployment-info">
                    <h4>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                        {deployment.name}
                      </a>
                    </h4>
                    <p className="deployment-meta">
                      <span>{getTimeAgo(deployment.createdAt)}</span>
                      {deployment.ready && deployment.createdAt && (
                        <span>Build: {formatDuration(deployment.createdAt, deployment.ready)}</span>
                      )}
                      {deployment.source && (
                        <span>Branch: {deployment.source.ref || 'main'}</span>
                      )}
                    </p>
                  </div>

                  <div className="deployment-actions">
                    <a 
                      href={`https://vercel.com/${user?.username}/${deployment.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="deployment-link"
                    >
                      View →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p>No recent deployments found</p>
        )}
      </div>

      {/* Projects List */}
      <div className="projects-list">
        <h3>Active Projects</h3>
        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.slice(0, 4).map(project => {
              const latestDeploy = project.recent_deployments?.[0]
              const status = latestDeploy ? getDeploymentStatus(latestDeploy.state) : null
              
              return (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4>
                      <a href={`https://${project.name}.vercel.app`} target="_blank" rel="noopener noreferrer">
                        {project.name}
                      </a>
                    </h4>
                    {status && (
                      <span className={`deploy-status status-${status.color}`}>
                        {status.icon} {status.text}
                      </span>
                    )}
                  </div>

                  <div className="project-info">
                    <p className="project-framework">
                      {project.framework || 'Static'}
                    </p>
                    
                    {latestDeploy && (
                      <div className="deploy-info">
                        <span>Last deploy: {getTimeAgo(latestDeploy.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Deployment Timeline */}
                  {project.recent_deployments && project.recent_deployments.length > 0 && (
                    <div className="deploy-timeline">
                      {project.recent_deployments.slice(0, 3).map(deploy => {
                        const deployStatus = getDeploymentStatus(deploy.state)
                        return (
                          <div key={deploy.uid} className="timeline-item">
                            <span className={`timeline-dot status-${deployStatus.color}`}>
                              {deployStatus.icon}
                            </span>
                            <span className="timeline-time">
                              {getTimeAgo(deploy.createdAt)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="project-actions">
                    <a 
                      href={`https://vercel.com/${user?.username}/${project.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      View Project →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p>No projects found</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="vercel-actions">
        <a 
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open Vercel Dashboard
        </a>
        <a 
          href="https://vercel.com/new"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Deploy New Project
        </a>
      </div>
    </div>
  )
}

export default VercelStatus