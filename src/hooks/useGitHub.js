import { useState, useEffect, useCallback } from 'react'
import { githubApi } from '../services/githubApi'

export const useGitHub = (username) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && lastFetch && Date.now() - lastFetch < 5 * 60 * 1000) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await githubApi.getUserStats(username)
      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err.message)
      console.error('GitHub API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [username, lastFetch])

  const refreshData = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    if (username) {
      fetchData()
    }
  }, [username, fetchData])

  return {
    data,
    loading,
    error,
    refreshData,
    lastFetch: lastFetch ? new Date(lastFetch) : null
  }
}

// Hook for individual repository data
export const useGitHubRepo = (username, repoName) => {
  const [repo, setRepo] = useState(null)
  const [languages, setLanguages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !repoName) return

    const fetchRepoData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [repoData, languagesData] = await Promise.all([
          githubApi.getUserProfile(username).then(() => 
            fetch(`https://api.github.com/repos/${username}/${repoName}`).then(r => r.json())
          ),
          githubApi.getRepoLanguages(username, repoName)
        ])

        setRepo(repoData)
        setLanguages(languagesData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRepoData()
  }, [username, repoName])

  return { repo, languages, loading, error }
}

// Hook for trending repositories
export const useGitHubTrending = (language = '', timeframe = 'week') => {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      setError(null)

      try {
        const trendingRepos = await githubApi.getTrendingRepos(language, timeframe)
        setTrending(trendingRepos)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [language, timeframe])

  const refresh = useCallback(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const trendingRepos = await githubApi.getTrendingRepos(language, timeframe)
        setTrending(trendingRepos)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [language, timeframe])

  return { trending, loading, error, refresh }
}