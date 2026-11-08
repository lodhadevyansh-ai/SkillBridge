
import 'dotenv/config'
import app from './src/app.js'

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('======================================')
  console.log('🚀 SkillBridge API Server Started')
  console.log(`🌐 Port: ${PORT}`)
  console.log('📡 Healthcheck: /api/health')
  console.log('🔐 Authentication: /api/auth/')
  console.log('======================================')
})

server.on('error', (error) => {
  console.error('❌ Server startup error:', error)
  process.exit(1)
})

export default server
