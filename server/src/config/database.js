import mongoose from 'mongoose'

let isConnected = false

/**
 * Mask MongoDB connection string for secure logging without exposing credentials
 * @param {string} uri
 * @returns {string} Sanitized URI
 */
function sanitizeMongoUri(uri) {
  if (!uri) return 'undefined'
  return uri.replace(/\/\/(.*?)@/, '//***:***@')
}

/**
 * Centralized MongoDB Atlas Connection Manager
 * Enforces production invariants, connection pooling, and resilient reconnection logic.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI
  const isProduction = process.env.NODE_ENV === 'production'

  if (!uri) {
    if (isProduction) {
      const errorMsg = 'CRITICAL DATABASE ERROR: MONGODB_URI environment variable is required in production.'
      console.error(`❌ [Database] ${errorMsg}`)
      throw new Error(errorMsg)
    }

    console.warn(
      '⚠️ [Database] MONGODB_URI not provided. Running in development/testing mode with local store.'
    )
    isConnected = false
    return null
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      autoIndex: !isProduction, // Do not build indexes in high-throughput production runtime
    }

    // Attach lifecycle listeners once
    if (mongoose.connection.listenerCount('connected') === 0) {
      mongoose.connection.on('connected', () => {
        isConnected = true
        console.log(`✅ [Database] Successfully connected to MongoDB cluster: ${sanitizeMongoUri(uri)}`)
      })

      mongoose.connection.on('error', (err) => {
        console.error('❌ [Database] MongoDB connection error:', err.message)
        isConnected = false
      })

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ [Database] MongoDB connection lost / disconnected')
        isConnected = false
      })

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 [Database] MongoDB reconnected successfully')
        isConnected = true
      })
    }

    const conn = await mongoose.connect(uri, options)
    isConnected = true
    return conn
  } catch (error) {
    isConnected = false
    console.error(`❌ [Database] Failed to connect to MongoDB Atlas (${sanitizeMongoUri(uri)}):`, error.message)

    if (isProduction) {
      throw new Error(`Production database connection failed: ${error.message}`)
    }

    return null
  }
}

export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

export function getConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return states[mongoose.connection.readyState] || 'unknown'
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    isConnected = false
    console.log('🔌 [Database] Gracefully disconnected from MongoDB')
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  getConnectionState,
}
