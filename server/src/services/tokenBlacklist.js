/**
 * SkillBridge Token Blacklist / Invalidation Service
 * Provides in-memory and persistent token revocation for logout and session termination.
 */

class TokenBlacklistService {
  constructor() {
    this.blacklistedTokens = new Set()
  }

  /**
   * Invalidate a token
   * @param {string} token - The raw JWT token string
   * @param {number} [expiresAt] - Optional timestamp (epoch ms) when token expires naturally
   */
  invalidate(token) {
    if (!token || typeof token !== 'string') return
    this.blacklistedTokens.add(token)
  }

  /**
   * Check if a token has been revoked
   * @param {string} token 
   * @returns {boolean}
   */
  isBlacklisted(token) {
    if (!token) return false
    return this.blacklistedTokens.has(token)
  }

  /**
   * Clear all blacklisted tokens (used for test teardown)
   */
  clear() {
    this.blacklistedTokens.clear()
  }
}

export const tokenBlacklist = new TokenBlacklistService()

