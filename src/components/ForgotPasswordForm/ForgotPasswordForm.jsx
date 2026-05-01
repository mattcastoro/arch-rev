import './ForgotPasswordForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"

function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')

  function handleSendCode(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('resetEmail')?.trim()
    const emailInput = event.currentTarget.elements.resetEmail

    if (!email) {
      setAlertMessage('Email is required to send a temporary code.')
      return
    }

    if (!emailInput.validity.valid) {
      setAlertMessage('Please enter a valid email address.')
      return
    }

    setAlertMessage('')
    navigate('/reset-password')
  }

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" noValidate onSubmit={handleSendCode}>
        {alertMessage && (
          <Alert onDismiss={() => setAlertMessage('')}>
            {alertMessage}
          </Alert>
        )}
        <FormField
          label="Email"
          id="resetEmail"
          type="email"
          placeholder="you@example.com"
          required
        />
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
