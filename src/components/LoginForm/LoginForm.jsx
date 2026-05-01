import './LoginForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import Paragraph from "../Paragraph/Paragraph"

function LoginForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.trim()
    const password = formData.get('password')?.trim()
    const emailInput = event.currentTarget.elements.email

    if (!email || !password) {
      setAlertMessage('Email and password are required before logging in.')
      return
    }

    if (!emailInput.validity.valid) {
      setAlertMessage('Please enter a valid email address.')
      return
    }

    setAlertMessage('')
  }

  return (
    <div className="login-container">
      <form className="login-form" noValidate onSubmit={handleSubmit}>
        {alertMessage && (
          <Alert onDismiss={() => setAlertMessage('')}>
            {alertMessage}
          </Alert>
        )}
        <div className="form-fields">
          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="tonystark@marvel.com"
            required
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            placeholder="***"
            required
          />
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" size="btn-md">Log In</Button>
          <Button type="button" variant="text" size="btn-sm">Forgot your password?</Button>
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
