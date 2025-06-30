const GitHubStats = ({ data, onRefresh }) => {
  if (!data) {
    return <div className="github-stats">No GitHub data available</div>
  }

  const { profile, repos, stats } = data

  return (
    <div className="github-stats">
      <div className="stats-header">
        <h2>GitHub Overview</h2>
        <button 
          onClick={onRefresh} 
          className="refresh-btn"
          title="Refresh GitHub data"
        >
          🔄
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Public Repos</h3>
          <p className="stat-number">{stats.totalRepos}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Stars</h3>
          <p className="stat-number">{stats.totalStars}</p>
        </div>
        
        <div className="stat-card">
          <h3>Followers</h3>
          <p className="stat-number">{stats.followers}</p>
        </div>
        
        <div className="stat-card">
          <h3>Languages</h3>
          <p className="stat-number">{stats.languagesCount}</p>
        </div>

        <div className="stat-card">
          <h3>Recent Commits</h3>
          <p className="stat-number">{stats.recentCommits}</p>
          <p className="stat-label">This week</p>
        </div>

        <div className="stat-card">
          <h3>Account Age</h3>
          <p className="stat-number">{stats.accountAge}</p>
          <p className="stat-label">Days</p>
        </div>
      </div>

      <div className="profile-summary">
        <div className="profile-avatar">
          <img 
            src={profile.avatar_url} 
            alt={profile.name || profile.login}
            width="60"
            height="60"
          />
        </div>
        <div className="profile-info">
          <h3>{profile.name || profile.login}</h3>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-links">
            {profile.blog && (
              <a href={profile.blog} target="_blank" rel="noopener noreferrer">
                🌐 Website
              </a>
            )}
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.company && <span>🏢 {profile.company}</span>}
          </div>
        </div>
      </div>

      <div className="recent-repos">
        <h3>Recent Repositories</h3>
        {repos && repos.length > 0 ? (
          <div className="repos-list">
            {repos.slice(0, 5).map(repo => (
              <div key={repo.id} className="repo-card">
                <div className="repo-header">
                  <h4>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                      {repo.name}
                    </a>
                  </h4>
                  {repo.private && <span className="private-badge">Private</span>}
                </div>
                <p className="repo-description">
                  {repo.description || 'No description available'}
                </p>
                <div className="repo-meta">
                  <span className="repo-stat">⭐ {repo.stargazers_count}</span>
                  <span className="repo-stat">🍴 {repo.forks_count}</span>
                  {repo.language && (
                    <span className="repo-language">📝 {repo.language}</span>
                  )}
                  <span className="repo-updated">
                    🕒 {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No repositories found</p>
        )}
      </div>

      <div className="github-links">
        <a 
          href={profile.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-profile-link"
        >
          View Full GitHub Profile →
        </a>
      </div>
    </div>
  )
}

export default GitHubStats