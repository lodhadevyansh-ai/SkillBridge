import 'dotenv/config'
import readline from 'readline'
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { User } from '../models/User.js'

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('=====================================================')
  console.log('🔐 SkillBridge Initial Administrator Setup Utility')
  console.log('=====================================================')

  await connectDatabase()

  const email = process.env.INITIAL_ADMIN_EMAIL || (await prompt('Admin Email: '))
  const password = process.env.INITIAL_ADMIN_PASSWORD || (await prompt('Admin Password (min 10 chars): '))
  const fullName = process.env.INITIAL_ADMIN_NAME || (await prompt('Admin Full Name: ')) || 'Platform Administrator'

  if (!email || !password || password.length < 10) {
    console.error('❌ Validation Error: Valid email and minimum 10-character password required.')
    await disconnectDatabase()
    process.exit(1)
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    console.log(`ℹ️ Account already exists for ${email}. Updating to role: 'admin'...`)
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    existing.role = 'admin'
    existing.passwordHash = passwordHash
    existing.status = 'Active'
    existing.isVerified = true
    await existing.save()
    console.log(`✅ Administrator credentials updated for: ${email}`)
  } else {
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    const nameParts = fullName.split(' ')
    const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() : 'AD'

    await User.create({
      id: `usr_admin_${Date.now()}`,
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
      initials,
      headline: 'Platform Operations Administrator',
      companyName: 'SkillBridge Admin',
      isVerified: true,
      status: 'Active',
    })
    console.log(`✅ New Administrator created successfully: ${email}`)
  }

  await disconnectDatabase()
  console.log('Done.')
}

main().catch((err) => {
  console.error('❌ Error creating admin:', err.message)
  process.exit(1)
})

