import './LoginForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import Paragraph from "../Paragraph/Paragraph"
import { setSession, validateLogin } from '../../lib/localData'

function LoginForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [invalidFields, setInvalidFields] = useState([])

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.trim()
    const password = formData.get('password')?.trim()
    const emailInput = event.currentTarget.elements.email

    const missingFields = ['email', 'password'].filter((field) => !formData.get(field)?.trim())
    if (missingFields.length > 0) {
      setInvalidFields(missingFields)
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    if (!emailInput.validity.valid) {
      setInvalidFields(['email'])
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    const loginResult = validateLogin(email, password)
    if (!loginResult.ok) {
      setInvalidFields([loginResult.message === 'Incorrect password.' ? 'password' : 'email'])
      setAlertMessage(loginResult.message)
      return
    }

    setSession(email)
    setInvalidFields([])
    setAlertMessage('')
    navigate('/home')
  }

  return (
    <div className="login-container">
      <form className="login-form" noValidate onSubmit={handleSubmit}>
        {alertMessage && (
          <Alert onDismiss={() => { setAlertMessage(''); setInvalidFields([]) }}>
            {alertMessage}
          </Alert>
        )}
        <div className="form-fields">
          <FormField
            label="Email"
            id="email"
            type="email"
            required
            invalid={invalidFields.includes('email')}
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            required
            invalid={invalidFields.includes('password')}
          />
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" size="btn-md">Log In</Button>
          <Button
            type="button"
            variant="text"
            size="btn-sm"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot your password?
          </Button>
        </div>
        <div className="signup-section">
          <Paragraph text="Don't have an account?"></Paragraph>
          <Button
            type="button"
            variant="secondary"
            size="btn-md"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
