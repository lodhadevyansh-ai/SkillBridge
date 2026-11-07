import { analyticsStore } from '../db/analyticsStore.js'

export const getStudentAnalytics = (req, res, next) => {
  try {
    const studentId = req.user.id
    const data = analyticsStore.getStudentAnalytics(studentId)
    res.json({
      success: true,
      data,
      analytics: data,
    })
  } catch (err) {
    next(err)
  }
}

export const getRecruiterAnalytics = (req, res, next) => {
  try {
    const recruiterId = req.user.id
    const data = analyticsStore.getRecruiterAnalytics(recruiterId)
    res.json({
      success: true,
      data,
      analytics: data,
    })
  } catch (err) {
    next(err)
  }
}

export const getAdminAnalytics = (req, res, next) => {
  try {
    const data = analyticsStore.getAdminAnalytics()
    res.json({
      success: true,
      data,
      analytics: data,
    })
  } catch (err) {
    next(err)
  }
}

