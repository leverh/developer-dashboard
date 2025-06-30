const ProjectsList = ({ data }) => {
  const repos = data?.repos || []
  
  // Filter and sort repositories to show as "projects"
  const projects = repos
    .filter(repo => !repo.fork) // Exclude forked repositories
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6) // Show top 6 projects

  const getProjectStatus = (repo) => {
    const lastUpdate = new Date(repo.updated_at)
    const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24))
    
    if (daysSinceUpdate <= 7) return 'Active'
    if (daysSinceUpdate <= 30) return 'Recent'
    if (daysSinceUpdate <= 90) return 'Stable'
    return 'Archived'
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'green'
      case 'recent': return 'blue'
      case 'stable': return 'orange'
      case 'archived': return 'gray'
      default: return 'gray'
    }
  }

  const getTechStack = (repo) => {
    const techs = []
    if (repo.language) techs.push(repo.language)
    
    // Add some common tech based on repository topics or name patterns
    if (repo.topics) {
      repo.topics.slice(0, 3).forEach(topic => {
        if (!techs.includes(topic)) {
          techs.push(topic)
        }
      })
    }
    
    return techs.slice(0, 4) // Limit to 4 tech tags
  }

  // Show placeholder if no GitHub data available
  if (!data || repos.length === 0) {
    const placeholderProjects = [
      {
        id: 1,
        name: 'Developer Dashboard',
        status: 'In Progress',
        tech: ['React', 'Vite', 'GitHub API'],
        lastUpdate: new Date().toISOString(),
        description: 'Personal command center for development work',
        stars: 0,
        isPlaceholder: true
      },
      {
        id: 2,
        name: 'Connect GitHub',
        status: 'Setup Required',
        tech: ['GitHub API'],
        lastUpdate: new Date().toISOString(),
        description: 'Connect your GitHub account to see real projects',
        stars: 0,
        isPlaceholder: true
      }
    ]

    return (
      <div className="projects-list">
        <h2>Recent Projects</h2>
        <div className="projects-grid">
          {placeholderProjects.map(project => (
            <div key={project.id} className="project-card placeholder">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`project-status status-${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <p className="project-description">{project.description}</p>
              
              <div className="project-tech">
                {project.tech.map(tech => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="project-meta">
                <span>⭐ {project.stars}</span>
                <span>Connect GitHub for real data</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="projects-list">
      <h2>Recent Projects</h2>
      <div className="projects-grid">
        {projects.map(repo => {
          const status = getProjectStatus(repo)
          const techStack = getTechStack(repo)
          
          return (
            <div key={repo.id} className="project-card">
              <div className="project-header">
                <h3>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </h3>
                <span className={`project-status status-${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              
              <p className="project-description">
                {repo.description || 'No description available'}
              </p>
              
              <div className="project-tech">
                {techStack.map(tech => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="project-meta">
                <span className="project-stat">⭐ {repo.stargazers_count}</span>
                <span className="project-stat">🍴 {repo.forks_count}</span>
                {repo.size > 0 && (
                  <span className="project-stat">📦 {Math.round(repo.size / 1024)}MB</span>
                )}
                <span className="project-updated">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>

              {repo.homepage && (
                <div className="project-links">
                  <a 
                    href={repo.homepage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    🌐 Live Demo
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="projects-actions">
        <a 
          href={`https://github.com/${data.profile?.login}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          View All Repositories ({repos.length})
        </a>
        {data.profile?.html_url && (
          <a 
            href={`${data.profile.html_url}/repositories/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Create New Repository
          </a>
        )}
      </div>

      <div className="projects-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-number">{projects.filter(p => getProjectStatus(p) === 'Active').length}</span>
            <span className="summary-label">Active Projects</span>
          </div>
          <div className="summary-stat">
            <span className="summary-number">{repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</span>
            <span className="summary-label">Total Stars</span>
          </div>
          <div className="summary-stat">
            <span className="summary-number">{new Set(repos.map(r => r.language).filter(Boolean)).size}</span>
            <span className="summary-label">Languages Used</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsList