import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Lock, Trash2 } from 'lucide-react'
import { Button, Card, Input, Modal, Alert } from '../ui'
import { useAuth } from '../../hooks/useAuth'

export function DeleteAccountSection() {
  const { deleteAccount, user } = useAuth()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleOpenModal = () => {
    setPassword('')
    setConfirmation('')
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isDeleting) return // Prevent closing while deletion request is in-flight
    setIsModalOpen(false)
    setPassword('')
    setConfirmation('')
    setErrorMessage('')
  }

  const isDeleteEnabled = password.trim().length > 0 && confirmation === 'DELETE' && !isDeleting

  const handleDeleteSubmit = async (e) => {
    e.preventDefault()
    if (!isDeleteEnabled) return

    setErrorMessage('')
    setIsDeleting(true)

    try {
      const result = await deleteAccount({ password, confirmation })

      if (result.success) {
        setIsModalOpen(false)
        // Redirect to Login page and display permanent deletion notice
        navigate('/login', {
          state: {
            deletedSuccessMessage: 'Your account has been permanently deleted.',
          },
          replace: true,
        })
      } else {
        setErrorMessage(result.message || 'Unable to delete your account right now. Please try again later.')
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to delete your account right now. Please try again later.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Danger Zone: Delete Account Card */}
      <Card className="border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <h3 className="text-base font-semibold text-red-950 dark:text-red-200">
                  Delete Account
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deleting your account is permanent. Your account and associated personal information will be permanently deleted.
              </p>
              {user?.role === 'admin' && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Note: The last active administrator account cannot be deleted for platform continuity.
                </p>
              )}
            </div>

            <div className="shrink-0">
              <Button
                variant="danger"
                leftIcon={Trash2}
                onClick={handleOpenModal}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-5">
          {/* Header Icon & Title */}
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Are you sure you want to permanently delete your account?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action cannot be undone. Your account and associated personal information will be permanently deleted.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <Alert variant="danger" title="Account Deletion Error">
              {errorMessage}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <div>
              <Input
                label="Current Password"
                type="password"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isDeleting}
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                To confirm, type <span className="font-mono text-red-600 dark:text-red-400 font-bold">DELETE</span> below
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type DELETE"
                disabled={isDeleting}
                className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
                required
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={!isDeleteEnabled}
                isLoading={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

