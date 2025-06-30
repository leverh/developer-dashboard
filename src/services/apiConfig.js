export const API_CONFIG = {
  github: {
    baseUrl: 'https://api.github.com',
    username: import.meta.env.VITE_GITHUB_USERNAME,
  },
  netlify: {
    baseUrl: 'https://api.netlify.com/api/v1',
  },
  vercel: {
    baseUrl: 'https://api.vercel.com',
  }
}

// Rate limiting and request configuration
export const REQUEST_CONFIG = {
  timeout: 10000,
  retries: 3,
}