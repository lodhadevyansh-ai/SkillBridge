/**
 * Transparent, Rule-Based Resume-to-Job Skill Matching Utility
 *
 * NOTE: This is an algorithmic keyword-compatibility calculator, NOT artificial intelligence.
 */

const SYNONYM_MAP = {
  // Web & Frameworks
  react: 'react',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'nodejs',
  'node.js': 'nodejs',
  node: 'nodejs',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  next: 'nextjs',
  vuejs: 'vue',
  'vue.js': 'vue',
  vue: 'vue',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  es6: 'javascript',
  python: 'python',
  py: 'python',

  // Styling & UI
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  'tailwind css': 'tailwindcss',
  css: 'css',
  css3: 'css',
  html: 'html',
  html5: 'html',

  // Design & UX
  figma: 'figma',
  'figma prototyping': 'figma',
  'ui/ux': 'ui/ux design',
  'ui/ux design': 'ui/ux design',
  'ui ux': 'ui/ux design',
  'ui ux design': 'ui/ux design',
  ui: 'ui design',
  'ui design': 'ui design',
  'user interface': 'ui design',
  ux: 'ux design',
  'ux design': 'ux design',
  'user experience': 'ux design',
  'user research': 'user research',
  wireframing: 'wireframing',
  prototyping: 'prototyping',
  'design systems': 'design systems',

  // Databases & Cloud
  postgres: 'postgresql',
  postgresql: 'postgresql',
  psql: 'postgresql',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  mysql: 'mysql',
  redis: 'redis',
  aws: 'aws',
  'amazon web services': 'aws',
  gcp: 'gcp',
  'google cloud': 'gcp',
  docker: 'docker',
  containerization: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  'ci/cd': 'ci/cd',
  cicd: 'ci/cd',

  // General & Tools
  git: 'git',
  github: 'git',
  'version control': 'git',
  rest: 'rest apis',
  'rest api': 'rest apis',
  'rest apis': 'rest apis',
  'restful apis': 'rest apis',
  graphql: 'graphql',
  gql: 'graphql',
  testing: 'testing',
  jest: 'testing',
  cypress: 'testing',
  qa: 'testing',
  'agile/scrum': 'agile',
  agile: 'agile',
  scrum: 'agile',
}

const SKILL_RECOMMENDATIONS = {
  typescript: {
    priority: 'High',
    estHours: 8,
    tip: 'Essential for type safety in modern full-stack codebases. Recommended: official TypeScript Handbook.',
  },
  react: {
    priority: 'High',
    estHours: 15,
    tip: 'Industry standard for modern declarative UI component development.',
  },
  'design systems': {
    priority: 'High',
    estHours: 10,
    tip: 'Key for scalable product consistency; practice tokenization and accessible UI kits in Figma.',
  },
  figma: {
    priority: 'High',
    estHours: 6,
    tip: 'Master auto-layout, interactive components, and developer handoff mode.',
  },
  'ui design': {
    priority: 'Medium',
    estHours: 12,
    tip: 'Study typography scale, visual hierarchy, spacing systems, and contrast compliance (WCAG).',
  },
  'ux design': {
    priority: 'Medium',
    estHours: 14,
    tip: 'Conduct qualitative interviews, journey mapping, and usability testing case studies.',
  },
  tailwindcss: {
    priority: 'Medium',
    estHours: 5,
    tip: 'Accelerates responsive styling with utility-first composition and dark-mode tokens.',
  },
  nodejs: {
    priority: 'High',
    estHours: 12,
    tip: 'Core for asynchronous backend services, middleware routing, and microservice APIs.',
  },
  postgresql: {
    priority: 'Medium',
    estHours: 8,
    tip: 'Learn relational schema design, indexing strategies, and ACID transaction semantics.',
  },
  docker: {
    priority: 'Medium',
    estHours: 6,
    tip: 'Practice multi-stage builds and local containerized development environments.',
  },
}

/**
 * Normalizes a skill string into a canonical representation
 */
export function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return ''
  const trimmed = skill.trim().toLowerCase()
  // Check exact dictionary match first
  if (SYNONYM_MAP[trimmed]) return SYNONYM_MAP[trimmed]

  // Strip punctuation and check again
  const clean = trimmed
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return SYNONYM_MAP[clean] || clean
}

/**
 * Calculates deterministic skill compatibility between student profile skills and job required skills
 */
export function calculateSkillMatch(profileSkills = [], jobRequiredSkills = []) {
  const profileList = Array.isArray(profileSkills) ? profileSkills : []
  const requiredList = Array.isArray(jobRequiredSkills) ? jobRequiredSkills : []

  // Create a map of normalized profile skills
  const normalizedProfileMap = new Map()
  profileList.forEach((sk) => {
    const norm = normalizeSkill(sk)
    if (norm) normalizedProfileMap.set(norm, sk)
  })

  // Compare against job required skills
  const matchingSkills = []
  const missingSkills = []

  requiredList.forEach((reqSkill) => {
    const norm = normalizeSkill(reqSkill)
    if (normalizedProfileMap.has(norm)) {
      matchingSkills.push({
        skill: reqSkill,
        profileSkill: normalizedProfileMap.get(norm),
        normalized: norm,
      })
    } else {
      missingSkills.push({
        skill: reqSkill,
        normalized: norm,
      })
    }
  })

  const totalRequired = requiredList.length
  const matchCount = matchingSkills.length

  let matchScore = 100
  if (totalRequired > 0) {
    matchScore = Math.min(100, Math.round((matchCount / totalRequired) * 100))
  }

  // Determine qualitative compatibility level
  let matchLevel = 'High Compatibility'
  let matchBadgeColor = 'emerald'
  if (matchScore < 50) {
    matchLevel = 'Growth Opportunity'
    matchBadgeColor = 'amber'
  } else if (matchScore < 75) {
    matchLevel = 'Moderate Match'
    matchBadgeColor = 'indigo'
  }

  // Build targeted improvement suggestions for missing skills
  const suggestedImprovements = missingSkills.slice(0, 4).map((item) => {
    const info = SKILL_RECOMMENDATIONS[item.normalized] || {
      priority: 'Recommended',
      estHours: 6,
      tip: `Review foundational concepts and build a hands-on mini-project demonstrating ${item.skill}.`,
    }
    return {
      skill: item.skill,
      priority: info.priority,
      estHours: info.estHours,
      tip: info.tip,
    }
  })

  return {
    matchScore,
    matchLevel,
    matchBadgeColor,
    totalRequired,
    matchingCount: matchCount,
    missingCount: missingSkills.length,
    matchingSkills: matchingSkills.map((m) => m.skill),
    missingSkills: missingSkills.map((m) => m.skill),
    suggestedImprovements,
    calculationDetails: {
      formula: 'Match % = (Matching Skills / Total Required Skills) × 100',
      matchingCount: matchCount,
      totalRequired,
      isAI: false,
      algorithm: 'Deterministic keyword overlap with canonical synonym normalization',
    },
    disclaimer:
      'This match score is an algorithmic estimate based on listed keywords in your candidate profile compared against employer requirements. It is provided for informational and self-improvement purposes only, does NOT use generative AI, and does not guarantee shortlisting or hiring success.',
  }
}
