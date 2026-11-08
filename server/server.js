import 'dotenv/config'
import app from './src/app.js'
import { connectDatabase, isDatabaseConnected } from './src/config/database.js'
import { seedMongoIfEmpty } from './src/db/seedMongo.js'

const PORT = parseInt(process.env.PORT || '5000', 10)
const isProduction = process.env.NODE_ENV === 'production'

async function bootstrap() {
  try {
    console.log('🔄 [Bootstrap] Initializing SkillBridge API...')

    // 1. Mandatory MongoDB connection in production; conditional in development/test
    if (isProduction || process.env.MONGODB_URI) {
      console.log('🔄 [Bootstrap] Establishing MongoDB connection...')
      const conn = await connectDatabase()
      if (conn) {
        // Run idempotent initial setup if collections are empty (only creates initial admin if explicitly configured)
        await seedMongoIfEmpty()
      }
    } else {
      console.log('ℹ️ [Bootstrap] Running in non-production mode without MONGODB_URI (local store fallback).')
    }

    if (isProduction && !isDatabaseConnected()) {
      throw new Error('Fatal: MongoDB connection could not be verified in production environment.')
    }

    // 2. Start HTTP server binding to 0.0.0.0 for Render compatibility
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('==============================================')
      console.log('🚀 SkillBridge Full-Stack API Server Started')
      console.log(`🌐 Host: 0.0.0.0 | Port: ${PORT}`)
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log('🩺 Health Check: /api/health')
      console.log('🔐 Authentication: /api/auth/')
      console.log('==============================================')
    })

    server.on('error', (error) => {
      console.error('❌ Server startup error:', error)
      process.exit(1)
    })

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`)
      server.close(async () => {
        try {
          const { disconnectDatabase } = await import('./src/config/database.js')
          await disconnectDatabase()
        } catch (e) {
          // ignore
        }
        console.log('✅ Server terminated cleanly.')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    return server
  } catch (error) {
    console.error('❌ Fatal error during server bootstrap:', error.message)
    process.exit(1)
  }
}

const server = await bootstrap()
export default server
