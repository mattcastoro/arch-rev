import './ForgotPasswordForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import { createPasswordResetCode } from '../../lib/localData'

function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [invalidFields, setInvalidFields] = useState([])

  function handleSendCode(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('resetEmail')?.trim()
    const emailInput = event.currentTarget.elements.resetEmail

    if (!email) {
      setInvalidFields(['resetEmail'])
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    if (!emailInput.validity.valid) {
      setSuccessMessage('')
      setInvalidFields(['resetEmail'])
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    const resetResult = createPasswordResetCode(email)
    if (!resetResult.ok) {
      setSuccessMessage('')
      setInvalidFields(['resetEmail'])
      setAlertMessage(resetResult.message)
      return
    }

    setAlertMessage('')
    setInvalidFields([])
    setSuccessMessage(`Temporary code: ${resetResult.code}`)
  }

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" noValidate onSubmit={handleSendCode}>
        {alertMessage && (
          <Alert onDismiss={() => { setAlertMessage(''); setInvalidFields([]) }}>
            {alertMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert
            title="Temporary code generated"
            variant="success"
            onDismiss={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}
        <FormField
          label="Email"
          id="resetEmail"
          type="email"
          required
          invalid={invalidFields.includes('resetEmail')}
        />
        <Button
          type="button"
          variant="primary"
          size="btn-md"
          onClick={() => navigate('/reset-password')}
        >
          Go To Reset Page
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="btn-md"
        >
          Send Temporary Code
        </Button>
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

export default ForgotPasswordForm
