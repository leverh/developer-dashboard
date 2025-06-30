import { useState } from 'react'
import GitHubCharts from './GitHubCharts'
import DeploymentCharts from './DeploymentCharts'
import ProductivityMetrics from './ProductivityMetrics'

const AnalyticsDashboard = ({ githubData }) => {
  const [activeTab, setActiveTab] = useState('github')

  const tabs = [
    { id: 'github', label: '📊 GitHub Analytics', component: GitHubCharts },
    { id: 'deployments', label: '🚀 Deployment Analytics', component: DeploymentCharts },
    { id: 'productivity', label: '⚡ Productivity Metrics', component: ProductivityMetrics }
  ]

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab)
    if (!activeTabData) return null

    const Component = activeTabData.component
    
    switch (activeTab) {
      case 'github':
        return <Component data={githubData} />
      case 'deployments':
        return <Component />
      case 'productivity':
        return <Component githubData={githubData} />
      default:
        return null
    }
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📈 Analytics Dashboard</h2>
        <p>Visualize your development metrics and insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="analytics-content">
        {renderTabContent()}
      </div>

      {/* Export Options */}
      <div className="analytics-actions">
        <button className="export-btn" onClick={() => window.print()}>
          📄 Export Report
        </button>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  )
}

export default AnalyticsDashboard