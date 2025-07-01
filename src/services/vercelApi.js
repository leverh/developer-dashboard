const VERCEL_BASE_URL = 'https://api.vercel.com'

class VercelApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'VercelApiError'
    this.status = status
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new VercelApiError(
      errorData.error?.message || `Vercel API Error: ${response.status}`,
      response.status
    )
  }
  return response.json()
}

const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
})

export const vercelApi = {
  // Get user information
  async getUser(token) {
    try {
      const response = await fetch(`${VERCEL_BASE_URL}/v2/user`, {
        headers: getAuthHeaders(token)
      })
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Vercel user:', error)
      throw error
    }
  },

  // Get all projects
  async getProjects(token, options = {}) {
    const { limit = 20 } = options
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      const response = await fetch(`${VERCEL_BASE_URL}/v9/projects?${params}`, {
        headers: getAuthHeaders(token)
      })
      const data = await handleApiResponse(response)
      return data.projects || []
    } catch (error) {
      console.error('Error fetching Vercel projects:', error)
      throw error
    }
  },

  // Get specific project
  async getProject(token, projectId) {
    try {
      const response = await fetch(`${VERCEL_BASE_URL}/v9/projects/${projectId}`, {
        headers: getAuthHeaders(token)
      })
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Vercel project:', error)
      throw error
    }
  },

  // Get deployments
  async getDeployments(token, options = {}) {
    const { limit = 10, projectId } = options
    
    try {
      let url = `${VERCEL_BASE_URL}/v6/deployments?limit=${limit}`
      if (projectId) {
        url += `&projectId=${projectId}`
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(token)
      })
      const data = await handleApiResponse(response)
      return data.deployments || []
    } catch (error) {
      console.error('Error fetching Vercel deployments:', error)
      throw error
    }
  },

  // Get deployment details
  async getDeployment(token, deploymentId) {
    try {
      const response = await fetch(`${VERCEL_BASE_URL}/v13/deployments/${deploymentId}`, {
        headers: getAuthHeaders(token)
      })
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Vercel deployment:', error)
      throw error
    }
  },

  // Get domains
  async getDomains(token, options = {}) {
    const { limit = 50 } = options
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      const response = await fetch(`${VERCEL_BASE_URL}/v5/domains?${params}`, {
        headers: getAuthHeaders(token)
      })
      const data = await handleApiResponse(response)
      return data.domains || []
    } catch (error) {
      console.error('Error fetching Vercel domains:', error)
      throw error
    }
  },

  // Get team information (if there is a team...)
  async getTeams(token) {
    try {
      const response = await fetch(`${VERCEL_BASE_URL}/v2/teams`, {
        headers: getAuthHeaders(token)
      })
      const data = await handleApiResponse(response)
      return data.teams || []
    } catch (error) {
      console.error('Error fetching Vercel teams:', error)
      throw error
    }
  },

  // Get comprehensive dashboard data
  async getDashboardData(token) {
    try {
      const [user, projects, deployments, domains] = await Promise.all([
        this.getUser(token),
        this.getProjects(token, { limit: 10 }),
        this.getDeployments(token, { limit: 20 }),
        this.getDomains(token).catch(() => [])
      ])

      // Get detailed deployment data for recent deployments
      const recentDeployments = deployments.slice(0, 10)

      // Calculate statistics
      const successfulDeployments = deployments.filter(d => d.state === 'READY').length
      const failedDeployments = deployments.filter(d => d.state === 'ERROR').length
      const buildingDeployments = deployments.filter(d => d.state === 'BUILDING').length

      // Group deployments by project
      const deploymentsByProject = {}
      deployments.forEach(deployment => {
        const projectName = deployment.name
        if (!deploymentsByProject[projectName]) {
          deploymentsByProject[projectName] = []
        }
        deploymentsByProject[projectName].push(deployment)
      })

      // Project details with recent deployments
      const projectsWithDeployments = projects.map(project => ({
        ...project,
        recent_deployments: deploymentsByProject[project.name] || []
      }))

      return {
        user,
        projects: projectsWithDeployments,
        deployments: recentDeployments,
        domains,
        stats: {
          totalProjects: projects.length,
          totalDeployments: deployments.length,
          successfulDeployments,
          failedDeployments,
          buildingDeployments,
          totalDomains: domains.length,
          deploymentSuccessRate: deployments.length > 0 ? 
            Math.round((successfulDeployments / deployments.length) * 100) : 100
        }
      }
    } catch (error) {
      console.error('Error fetching Vercel dashboard data:', error)
      throw error
    }
  }
}