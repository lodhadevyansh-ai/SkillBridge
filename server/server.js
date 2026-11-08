import 'dotenv/config'
import app from './src/app.js'
import { connectDatabase } from './src/config/database.js'
import { seedMongoIfEmpty } from './src/db/seedMongo.js'
import { userStore } from './src/db/userStore.js'

const PORT = process.env.PORT || 5000

async function bootstrap() {
  try {
    // 1. Establish database connection if MONGODB_URI is provided
    if (process.env.MONGODB_URI) {
      console.log('🔄 [Bootstrap] Connecting to MongoDB Atlas...')
      const conn = await connectDatabase()
      if (conn) {
        await seedMongoIfEmpty()
        await userStore.syncFromMongo()
      }
    } else {
      console.log('ℹ️ [Bootstrap] MONGODB_URI not set. Running with built-in storage.')
    }

    // 2. Start HTTP server binding to 0.0.0.0
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('======================================')
      console.log('🚀 SkillBridge API Server Started')
      console.log(`🌐 Host: 0.0.0.0 | Port: ${PORT}`)
      console.log('📡 Healthcheck: /api/health')
      console.log('🔐 Authentication: /api/auth/')
      console.log('======================================')
    })

    server.on('error', (error) => {
      console.error('❌ Server startup error:', error)
      process.exit(1)
    })

    return server
  } catch (error) {
    console.error('❌ Fatal error during server bootstrap:', error)
    process.exit(1)
  }
}

const server = await bootstrap()
export default server
