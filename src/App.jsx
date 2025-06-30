import { useState, useEffect } from 'react'
import GitHubStats from './components/GitHubStats'
import ProjectsList from './components/ProjectsList'
import ActivityFeed from './components/ActivityFeed'
import ProfileOverview from './components/ProfileOverview'

function App() {
  const [githubData, setGithubData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // GitHub API
  const fetchGitHubData = async () => {
    setLoading(true)
    try {
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    // fetchGitHubData()
    setLoading(false) // For now stop loading
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Developer Dashboard</h1>
        <p>Your development command center</p>
      </header>

      <main className="dashboard-main">
        {loading && <div className="loading">Loading your data...</div>}
        
        {error && (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={fetchGitHubData}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="dashboard-grid">
            <section className="profile-section">
              <ProfileOverview data={githubData} />
            </section>

            <section className="stats-section">
              <GitHubStats data={githubData} />
            </section>

            <section className="projects-section">
              <ProjectsList data={githubData} />
            </section>

            <section className="activity-section">
              <ActivityFeed data={githubData} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App