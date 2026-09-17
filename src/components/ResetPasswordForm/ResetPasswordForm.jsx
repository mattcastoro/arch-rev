import './ResetPasswordForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import { resetPasswordWithCode } from '../../lib/localData'

function ResetPasswordForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [invalidFields, setInvalidFields] = useState([])

  function handleResetPassword(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const temporaryCode = formData.get('temporaryCode')?.trim()
    const newPassword = formData.get('newPassword')?.trim()
    const confirmNewPassword = formData.get('confirmNewPassword')?.trim()

    const missingFields = [
      ['temporaryCode', temporaryCode],
      ['newPassword', newPassword],
      ['confirmNewPassword', confirmNewPassword],
    ].filter(([, value]) => !value).map(([field]) => field)
    if (missingFields.length > 0) {
      setInvalidFields(missingFields)
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setInvalidFields(['newPassword', 'confirmNewPassword'])
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    const resetResult = resetPasswordWithCode(temporaryCode, newPassword)
    if (!resetResult.ok) {
      setInvalidFields(['temporaryCode'])
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    setAlertMessage('')
    setInvalidFields([])
    navigate('/login')
  }

  return (
    <div className="reset-password-container">
      <form className="reset-password-form" noValidate onSubmit={handleResetPassword}>
        {alertMessage && (
          <Alert onDismiss={() => { setAlertMessage(''); setInvalidFields([]) }}>
            {alertMessage}
          </Alert>
        )}
        <FormField
          label="Temporary Code"
          id="temporaryCode"
          type="text"
          required
          invalid={invalidFields.includes('temporaryCode')}
        />
        <FormField
          label="New Password"
          id="newPassword"
          type="password"
          required
          invalid={invalidFields.includes('newPassword')}
        />
        <FormField
          label="Confirm New Password"
          id="confirmNewPassword"
          type="password"
          required
          invalid={invalidFields.includes('confirmNewPassword')}
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
