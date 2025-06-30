const GITHUB_BASE_URL = 'https://api.github.com'

class GitHubApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new GitHubApiError(
      errorData.message || `GitHub API Error: ${response.status}`,
      response.status
    )
  }
  return response.json()
}

export const githubApi = {
  // Get user profile information
  async getUserProfile(username) {
    try {
      const response = await fetch(`${GITHUB_BASE_URL}/users/${username}`)
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  // Get user repositories
  async getUserRepos(username, options = {}) {
    const {
      sort = 'updated',
      per_page = 10,
      type = 'owner'
    } = options

    try {
      const params = new URLSearchParams({
        sort,
        per_page: per_page.toString(),
        type
      })
      
      const response = await fetch(`${GITHUB_BASE_URL}/users/${username}/repos?${params}`)
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw error
    }
  },

  // Get user's recent activity/events
  async getUserEvents(username, per_page = 10) {
    try {
      const response = await fetch(`${GITHUB_BASE_URL}/users/${username}/events?per_page=${per_page}`)
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching user events:', error)
      throw error
    }
  },

  // Get repository languages
  async getRepoLanguages(username, repoName) {
    try {
      const response = await fetch(`${GITHUB_BASE_URL}/repos/${username}/${repoName}/languages`)
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching repository languages:', error)
      throw error
    }
  },

  // Get user's contribution stats (GraphQL API)
  async getUserStats(username) {
    try {
      const [profile, repos, events] = await Promise.all([
        this.getUserProfile(username),
        this.getUserRepos(username, { per_page: 100 }),
        this.getUserEvents(username, 100)
      ])

      // Calculate stats from the data
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)
      const languages = new Set()
      
      repos.forEach(repo => {
        if (repo.language) {
          languages.add(repo.language)
        }
      })

      // Count recent commits from events
      const recentCommits = events.filter(event => 
        event.type === 'PushEvent' && 
        new Date(event.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).reduce((sum, event) => sum + (event.payload.commits?.length || 0), 0)

      return {
        profile,
        repos,
        events,
        stats: {
          totalRepos: profile.public_repos,
          totalStars,
          totalForks,
          followers: profile.followers,
          following: profile.following,
          languagesCount: languages.size,
          recentCommits,
          accountAge: Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24))
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  },

  // Get trending repositories (using search API)
  async getTrendingRepos(language = '', timeframe = 'week') {
    try {
      const date = new Date()
      date.setDate(date.getDate() - (timeframe === 'week' ? 7 : 30))
      const dateString = date.toISOString().split('T')[0]
      
      const query = `created:>${dateString}${language ? ` language:${language}` : ''}`
      const params = new URLSearchParams({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: '10'
      })

      const response = await fetch(`${GITHUB_BASE_URL}/search/repositories?${params}`)
      const data = await handleApiResponse(response)
      return data.items
    } catch (error) {
      console.error('Error fetching trending repos:', error)
      throw error
    }
  }
}