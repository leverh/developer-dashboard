import GitHubStats from './components/GitHubStats'
import ProjectsList from './components/ProjectsList'
import ActivityFeed from './components/ActivityFeed'
import ProfileOverview from './components/ProfileOverview'
import DeploymentOverview from './components/DeploymentOverview'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ThemeMenu from './components/ThemeMenu'
import ScrollToTop from './components/ScrollToTop'
import { useGitHub } from './hooks/useGitHub'

function App() {
  const username = import.meta.env.VITE_GITHUB_USERNAME
  const appName = import.meta.env.VITE_APP_NAME || 'Developer Dashboard'
  
  const { data: githubData, loading, error, refreshData, lastFetch } = useGitHub(username)


  return (
    <div className="dashboard">
      {/* Theme Toggle */}
      <ThemeMenu />

      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      <header className="dashboard-header">
        <h1>{appName}</h1>
        <p>Your development command center</p>
        {lastFetch && (
          <p className="last-update">
            Last updated: {lastFetch.toLocaleTimeString()}
          </p>
        )}
      </header>

      <main className="dashboard-main">
        {loading && <div className="loading">Loading your data...</div>}
        
        {error && (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={refreshData}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="dashboard-grid">
            <section className="profile-section">
              <ProfileOverview data={githubData} />
            </section>

            <section className="stats-section">
              <GitHubStats data={githubData} onRefresh={refreshData} />
            </section>

            <section className="deployments-section">
              <DeploymentOverview />
            </section>

            <section className="analytics-section">
              <AnalyticsDashboard githubData={githubData} />
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