import app from './src/app.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 SkillBridge API Server running on http://localhost:${PORT}`)
  console.log(`📡 Healthcheck available at http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoints live at http://localhost:${PORT}/api/auth/`)
})

