const ProfileOverview = ({ data }) => {
  const profile = data?.profile
  const stats = data?.stats
  const appName = import.meta.env.VITE_APP_NAME || 'Developer Dashboard'
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

  return (
    <div className="profile-overview">
      <h2>Profile Overview</h2>
      <div className="profile-content">
        <div className="profile-avatar">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.name || profile.login}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">👨‍💻</div>
          )}
        </div>
        
        <div className="profile-info">
          <h3>{profile?.name || profile?.login || 'Developer'}</h3>
          <p className="profile-subtitle">
            {profile?.bio || 'Welcome to your development command center'}
          </p>
          
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-label">Repositories</span>
              <span className="stat-value">{stats?.totalRepos || 0}</span>
            </div>
            
            <div className="quick-stat">
              <span className="stat-label">This Week</span>
              <span className="stat-value">{stats?.recentCommits || 0} commits</span>
            </div>
            
            <div className="quick-stat">
              <span className="stat-label">Total Stars</span>
              <span className="stat-value">{stats?.totalStars || 0}</span>
            </div>
            
            <div className="quick-stat">
              <span className="stat-label">Status</span>
              <span className="stat-value status-active">
                {stats?.recentCommits > 0 ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>

          {profile && (
            <div className="profile-details">
              <div className="profile-badges">
                {profile.public_repos > 10 && (
                  <span className="badge">📚 Prolific</span>
                )}
                {stats?.totalStars > 50 && (
                  <span className="badge">⭐ Popular</span>
                )}
                {stats?.languagesCount > 5 && (
                  <span className="badge">🌟 Polyglot</span>
                )}
                {stats?.accountAge > 365 && (
                  <span className="badge">🎖️ Veteran</span>
                )}
              </div>

              <div className="profile-meta">
                <span>📅 Joined {new Date(profile.created_at).getFullYear()}</span>
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.company && <span>🏢 {profile.company}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-info">
        <div className="dashboard-meta">
          <span className="app-name">{appName}</span>
          <span className="app-version">v{appVersion}</span>
        </div>
        <div className="dashboard-status">
          <span className="status-indicator">🟢</span>
          <span>All systems operational</span>
        </div>
      </div>
    </div>
  )
}

export default ProfileOverview