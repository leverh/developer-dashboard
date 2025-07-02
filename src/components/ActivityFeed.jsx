import { useState } from 'react'

const ActivityFeed = ({ data }) => {
  const [showAll, setShowAll] = useState(false)

  const formatActivity = (event) => {
    const timeAgo = getTimeAgo(event.created_at)
    
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits?.length || 0
        return {
          icon: '📝',
          message: `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'commit'
        }
      
      case 'CreateEvent':
        if (event.payload.ref_type === 'repository') {
          return {
            icon: '🎉',
            message: `Created repository ${event.repo.name}`,
            repo: event.repo.name,
            time: timeAgo,
            type: 'create'
          }
        }
        return {
          icon: '🌱',
          message: `Created ${event.payload.ref_type} in ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'create'
        }
      
      case 'IssuesEvent':
        return {
          icon: event.payload.action === 'opened' ? '🐛' : '✅',
          message: `${event.payload.action} issue in ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'issue'
        }
      
      case 'PullRequestEvent':
        return {
          icon: event.payload.action === 'opened' ? '🔀' : '✅',
          message: `${event.payload.action} pull request in ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'pr'
        }
      
      case 'WatchEvent':
        return {
          icon: '⭐',
          message: `Starred ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'star'
        }
      
      case 'ForkEvent':
        return {
          icon: '🍴',
          message: `Forked ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'fork'
        }
      
      default:
        return {
          icon: '📊',
          message: `${event.type.replace('Event', '')} in ${event.repo.name}`,
          repo: event.repo.name,
          time: timeAgo,
          type: 'other'
        }
    }
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const eventDate = new Date(dateString)
    const diffInMinutes = Math.floor((now - eventDate) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes}m ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d ago`
    }
    
    return eventDate.toLocaleDateString()
  }

  // Use real GitHub events or placeholder
  const activities = data?.events 
    ? data.events.map(formatActivity)
    : [
        {
          icon: '📝',
          message: 'Connect your GitHub account to see real activity',
          repo: '',
          time: 'Recently',
          type: 'placeholder'
        }
      ]

  // Show limited or all activities based on state
  const displayedActivities = showAll ? activities : activities.slice(0, 10)

  return (
    <div className="activity-feed">
      <h2>Recent Activity</h2>
      
      <div className="activity-list">
        {displayedActivities.map((activity, index) => (
          <div key={index} className={`activity-item ${activity.type}`}>
            <div className="activity-icon">
              {activity.icon}
            </div>
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <div className="activity-meta">
                {activity.repo && (
                  <span className="activity-repo">{activity.repo}</span>
                )}
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data?.events && data.events.length > 10 && (
        <div className="activity-actions">
          <button 
            className="btn-link"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? `Show Less` 
              : `View All Activity (${activities.length} total)`
            }
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed