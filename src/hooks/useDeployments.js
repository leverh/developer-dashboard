import { useState, useEffect, useCallback } from 'react'
import { netlifyApi } from '../services/netlifyApi'
import { vercelApi } from '../services/vercelApi'

// Custom hook for Netlify data
export const useNetlify = (token) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!token) {
      setLoading(false)
      setError('No Netlify token provided')
      return
    }

    if (!forceRefresh && lastFetch && Date.now() - lastFetch < 5 * 60 * 1000) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await netlifyApi.getDashboardData(token)
      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err.message)
      console.error('Netlify API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, lastFetch])

  const refreshData = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refreshData,
    lastFetch: lastFetch ? new Date(lastFetch) : null
  }
}

// Custom hook for Vercel data
export const useVercel = (token) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!token) {
      setLoading(false)
      setError('No Vercel token provided')
      return
    }

    if (!forceRefresh && lastFetch && Date.now() - lastFetch < 5 * 60 * 1000) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await vercelApi.getDashboardData(token)
      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err.message)
      console.error('Vercel API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, lastFetch])

  const refreshData = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refreshData,
    lastFetch: lastFetch ? new Date(lastFetch) : null
  }
}

// Combined hook for both services
export const useDeployments = () => {
  const netlifyToken = import.meta.env.VITE_NETLIFY_TOKEN
  const vercelToken = import.meta.env.VITE_VERCEL_TOKEN

  const netlify = useNetlify(netlifyToken)
  const vercel = useVercel(vercelToken)

  const refreshAll = useCallback(() => {
    netlify.refreshData()
    vercel.refreshData()
  }, [netlify.refreshData, vercel.refreshData])

  // Combined loading state
  const loading = netlify.loading || vercel.loading

  // Combined error state
  const errors = []
  if (netlify.error) errors.push(`Netlify: ${netlify.error}`)
  if (vercel.error) errors.push(`Vercel: ${vercel.error}`)

  // Combined stats
  const combinedStats = {
    totalSites: (netlify.data?.stats.totalSites || 0) + (vercel.data?.stats.totalProjects || 0),
    totalDeployments: (netlify.data?.stats.totalDeployments || 0) + (vercel.data?.stats.totalDeployments || 0),
    successfulDeployments: (netlify.data?.stats.successfulDeployments || 0) + (vercel.data?.stats.successfulDeployments || 0),
    failedDeployments: (vercel.data?.stats.failedDeployments || 0),
    averageSuccessRate: netlify.data && vercel.data ? 
      Math.round(((netlify.data.stats.deploymentSuccessRate + vercel.data.stats.deploymentSuccessRate) / 2)) :
      netlify.data?.stats.deploymentSuccessRate || vercel.data?.stats.deploymentSuccessRate || 100
  }

  return {
    netlify,
    vercel,
    loading,
    errors,
    combinedStats,
    refreshAll,
    hasNetlify: !!netlifyToken,
    hasVercel: !!vercelToken
  }
}