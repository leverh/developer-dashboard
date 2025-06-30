import { useDeployments } from '../hooks/useDeployments'
import NetlifyStatus from './NetlifyStatus'
import VercelStatus from './VercelStatus'

const DeploymentOverview = () => {
  const {
    netlify,
    vercel,
    loading,
    errors,
    combinedStats,
    refreshAll,
    hasNetlify,
    hasVercel
  } = useDeployments()

  // If no tokens are configured
  if (!hasNetlify && !hasVercel) {
    return (
      <div className="deployment-overview">
        <h2>Deployment Status</h2>
        <div className="no-deployment-services">
          <div className="setup-message">
            <h3>🚀 Connect Your Deployment Services</h3>
            <p>Add your API tokens to see deployment status from Netlify and Vercel:</p>
            
            <div className="setup-instructions">
              <div className="service-setup">
                <h4>Netlify Setup:</h4>
                <ol>
                  <li>Go to <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer">Netlify Personal Access Tokens</a></li>
                  <li>Generate a new token</li>
                  <li>Add <code>VITE_NETLIFY_TOKEN=your_token_here</code> to your .env file</li>
                </ol>
              </div>
              
              <div className="service-setup">
                <h4>Vercel Setup:</h4>
                <ol>
                  <li>Go to <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer">Vercel Account Tokens</a></li>
                  <li>Create a new token</li>
                  <li>Add <code>VITE_VERCEL_TOKEN=your_token_here</code> to your .env file</li>
                </ol>
              </div>
            </div>
            
            <p className="restart-note">
              💡 <strong>Remember to restart your dev server after adding tokens!</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="deployment-overview">
      {/* Combined Header */}
      <div className="deployment-header">
        <h2>Deployment Status</h2>
        <div className="header-actions">
          <button onClick={refreshAll} className="refresh-all-btn" disabled={loading}>
            🔄 Refresh All
          </button>
        </div>
      </div>

      {/* Combined Stats */}
      {(hasNetlify || hasVercel) && (
        <div className="combined-stats">
          <div className="stat-card">
            <h3>Total Sites</h3>
            <p className="stat-number">{combinedStats.totalSites}</p>
            <p className="stat-detail">
              {hasNetlify && netlify.data && `Netlify: ${netlify.data.stats.totalSites}`}
              {hasNetlify && hasVercel && netlify.data && vercel.data && ' • '}
              {hasVercel && vercel.data && `Vercel: ${vercel.data.stats.totalProjects}`}
            </p>
          </div>

          <div className="stat-card">
            <h3>Success Rate</h3>
            <p className="stat-number">{combinedStats.averageSuccessRate}%</p>
            <p className="stat-detail">Deployment success rate</p>
          </div>

          <div className="stat-card">
            <h3>Total Deployments</h3>
            <p className="stat-number">{combinedStats.totalDeployments}</p>
            <p className="stat-detail">Recent deployments</p>
          </div>

          <div className="stat-card">
            <h3>Status</h3>
            <p className="stat-number">
              {combinedStats.averageSuccessRate >= 90 ? '🟢' : 
               combinedStats.averageSuccessRate >= 70 ? '🟡' : '🔴'}
            </p>
            <p className="stat-detail">
              {combinedStats.averageSuccessRate >= 90 ? 'Excellent' : 
               combinedStats.averageSuccessRate >= 70 ? 'Good' : 'Needs Attention'}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="deployment-errors">
          <h3>⚠️ Connection Issues</h3>
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <p>{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Service Sections */}
      <div className="deployment-services">
        {hasNetlify && (
          <div className="service-section">
            <NetlifyStatus 
              data={netlify.data}
              loading={netlify.loading}
              error={netlify.error}
              onRefresh={netlify.refreshData}
            />
          </div>
        )}

        {hasVercel && (
          <div className="service-section">
            <VercelStatus 
              data={vercel.data}
              loading={vercel.loading}
              error={vercel.error}
              onRefresh={vercel.refreshData}
            />
          </div>
        )}
      </div>

      {/* Quick Insights */}
      {(netlify.data || vercel.data) && (
        <div className="deployment-insights">
          <h3>💡 Insights</h3>
          <div className="insights-grid">
            {netlify.data && netlify.data.stats.totalForms > 0 && (
              <div className="insight-card">
                <h4>📝 Active Forms</h4>
                <p>You have {netlify.data.stats.totalForms} form(s) collecting submissions on Netlify</p>
              </div>
            )}

            {vercel.data && vercel.data.stats.totalDomains > 0 && (
              <div className="insight-card">
                <h4>🌐 Custom Domains</h4>
                <p>You have {vercel.data.stats.totalDomains} custom domain(s) configured on Vercel</p>
              </div>
            )}

            {combinedStats.averageSuccessRate < 90 && (
              <div className="insight-card warning">
                <h4>⚠️ Deployment Issues</h4>
                <p>Consider checking recent failed deployments to improve success rate</p>
              </div>
            )}

            {combinedStats.totalSites > 10 && (
              <div className="insight-card">
                <h4>🚀 Prolific Developer</h4>
                <p>You're managing {combinedStats.totalSites} sites across platforms!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeploymentOverview