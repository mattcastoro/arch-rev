import './ResetPasswordForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"

function ResetPasswordForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')

  function handleResetPassword(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const temporaryCode = formData.get('temporaryCode')?.trim()
    const newPassword = formData.get('newPassword')?.trim()
    const confirmNewPassword = formData.get('confirmNewPassword')?.trim()

    if (!temporaryCode || !newPassword || !confirmNewPassword) {
      setAlertMessage('Temporary code and both password fields are required.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setAlertMessage('New password and confirmation password must match.')
      return
    }

    setAlertMessage('')
  }

  return (
    <div className="reset-password-container">
      <form className="reset-password-form" noValidate onSubmit={handleResetPassword}>
        {alertMessage && (
          <Alert onDismiss={() => setAlertMessage('')}>
            {alertMessage}
          </Alert>
        )}
        <FormField
          label="Temporary Code"
          id="temporaryCode"
          type="text"
          placeholder="Enter code from email"
          required
        />
        <FormField
          label="New Password"
          id="newPassword"
          type="password"
          placeholder=""
          required
        />
        <FormField
          label="Confirm New Password"
          id="confirmNewPassword"
          type="password"
          placeholder=""
          required
        />
        <Button type="submit" variant="primary" size="btn-md">Reset Password</Button>
        <Button
          type="button"
          variant="secondary"
          size="btn-md"
          onClick={() => navigate('/login')}
        >
          Cancel
        </Button>
      </form>
    </div>
  )
}

export default ResetPasswordForm
