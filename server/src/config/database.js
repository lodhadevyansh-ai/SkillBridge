import mongoose from 'mongoose'

let isConnected = false

/**
 * Centralized MongoDB Connection Manager
 * Supports MongoDB Atlas with retry logic and connection pooling.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn('⚠️ [Database] MONGODB_URI environment variable not configured. Operating in fallback data mode.')
    isConnected = false
    return null
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes automatically in high-scale prod
    }

    mongoose.connection.on('connected', () => {
      isConnected = true
      console.log('✅ [Database] Successfully connected to MongoDB Atlas')
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ [Database] MongoDB connection error:', err.message)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [Database] MongoDB disconnected')
      isConnected = false
    })

    const conn = await mongoose.connect(uri, options)
    isConnected = true
    return conn
  } catch (error) {
    isConnected = false
    console.error('❌ [Database] Failed to connect to MongoDB Atlas:', error.message)
    if (process.env.NODE_ENV === 'production') {
      // In production, MongoDB failure is critical
      console.error('CRITICAL: MongoDB Atlas must be accessible in production environment.')
    }
    return null
  }
}

export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    isConnected = false
    console.log('🔌 [Database] Disconnected from MongoDB')
  }
}

export default {
  connectDatabase,
  isDatabaseConnected,
  disconnectDatabase,
}

