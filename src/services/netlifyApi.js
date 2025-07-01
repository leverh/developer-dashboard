const NETLIFY_BASE_URL = 'https://api.netlify.com/api/v1'

class NetlifyApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'NetlifyApiError'
    this.status = status
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new NetlifyApiError(
      errorData.message || `Netlify API Error: ${response.status}`,
      response.status
    )
  }
  return response.json()
}

const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
})

export const netlifyApi = {
  async getSites(token) {
    try {
      const response = await fetch(`${NETLIFY_BASE_URL}/sites`, {
        headers: getAuthHeaders(token)
      })
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Netlify sites:', error)
      throw error
    }
  },

  // Specific site details
  async getSite(token, siteId) {
    try {
      const response = await fetch(`${NETLIFY_BASE_URL}/sites/${siteId}`, {
        headers: getAuthHeaders(token)
      })
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Netlify site:', error)
      throw error
    }
  },

  // Deployments for a site
  async getDeployments(token, siteId, options = {}) {
    const { per_page = 10, page = 1 } = options
    
    try {
      const params = new URLSearchParams({
        per_page: per_page.toString(),
        page: page.toString()
      })
      
      const response = await fetch(
        `${NETLIFY_BASE_URL}/sites/${siteId}/deploys?${params}`,
        { headers: getAuthHeaders(token) }
      )
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Netlify deployments:', error)
      throw error
    }
  },

  // Build hooks for a site
  async getBuildHooks(token, siteId) {
    try {
      const response = await fetch(
        `${NETLIFY_BASE_URL}/sites/${siteId}/build_hooks`,
        { headers: getAuthHeaders(token) }
      )
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Netlify build hooks:', error)
      throw error
    }
  },

  // Forms for a site
  async getForms(token, siteId) {
    try {
      const response = await fetch(
        `${NETLIFY_BASE_URL}/sites/${siteId}/forms`,
        { headers: getAuthHeaders(token) }
      )
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching Netlify forms:', error)
      throw error
    }
  },

  // Form submissions
  async getFormSubmissions(token, formId, options = {}) {
    const { per_page = 20 } = options
    
    try {
      const params = new URLSearchParams({
        per_page: per_page.toString()
      })
      
      const response = await fetch(
        `${NETLIFY_BASE_URL}/forms/${formId}/submissions?${params}`,
        { headers: getAuthHeaders(token) }
      )
      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error fetching form submissions:', error)
      throw error
    }
  },

  // Account information
  async getAccount(token) {
    try {
      const response = await fetch(`${NETLIFY_BASE_URL}/accounts`, {
        headers: getAuthHeaders(token)
      })
      const accounts = await handleApiResponse(response)
      return accounts[0] // Return primary account
    } catch (error) {
      console.error('Error fetching Netlify account:', error)
      throw error
    }
  },

  // Dashboard data
  async getDashboardData(token) {
    try {
      const [sites, account] = await Promise.all([
        this.getSites(token),
        this.getAccount(token)
      ])

      // Deployment data for each site
      const sitesWithDeployments = await Promise.all(
        sites.slice(0, 5).map(async (site) => {
          try {
            const deployments = await this.getDeployments(token, site.id, { per_page: 5 })
            const forms = await this.getForms(token, site.id).catch(() => [])
            
            return {
              ...site,
              recent_deployments: deployments,
              forms: forms
            }
          } catch (error) {
            console.warn(`Error fetching data for site ${site.name}:`, error)
            return {
              ...site,
              recent_deployments: [],
              forms: []
            }
          }
        })
      )

      // Summary statistics
      const totalDeployments = sitesWithDeployments.reduce(
        (sum, site) => sum + (site.recent_deployments?.length || 0), 0
      )
      
      const successfulDeployments = sitesWithDeployments.reduce(
        (sum, site) => sum + (site.recent_deployments?.filter(d => d.state === 'ready').length || 0), 0
      )

      const totalForms = sitesWithDeployments.reduce(
        (sum, site) => sum + (site.forms?.length || 0), 0
      )

      return {
        account,
        sites: sitesWithDeployments,
        stats: {
          totalSites: sites.length,
          totalDeployments,
          successfulDeployments,
          totalForms,
          deploymentSuccessRate: totalDeployments > 0 ? 
            Math.round((successfulDeployments / totalDeployments) * 100) : 100
        }
      }
    } catch (error) {
      console.error('Error fetching Netlify dashboard data:', error)
      throw error
    }
  }
}