import './SignUpForm.css'
import { useState } from 'react'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"

function SignUpForm() {
  const [alertMessage, setAlertMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const emailInput = event.currentTarget.elements.email
    const requiredFields = [
      ['streetAddress', 'Street address'],
      ['firstName', 'First name'],
      ['lastName', 'Last name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
    ]

    const missingFields = requiredFields
      .filter(([name]) => !formData.get(name)?.trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      setAlertMessage(`Please complete: ${missingFields.join(', ')}.`)
      return
    }

    if (!emailInput.validity.valid) {
      setAlertMessage('Please enter a valid email address.')
      return
    }

    setAlertMessage('')
  }

  return (
    <div className='signUp-container'>
      <form className="signUp-form" noValidate onSubmit={handleSubmit}>
        {alertMessage && (
          <Alert onDismiss={() => setAlertMessage('')}>
            {alertMessage}
          </Alert>
        )}
        <FormField
          label="Street Address"
          id="streetAddress"
          type="text"
          placeholder=""
          required
        />
        <div className="divider"></div>
        <div className="form-fields">
          <FormField
            label="First Name"
            id="firstName"
            type="text"
            placeholder=""
            required
          />
          <FormField
            label="Last Name"
            id="lastName"
            type="text"
            placeholder=""
            required
          />
        </div>
        <div className="form-fields">
          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder=""
            required
          />
          <FormField
            label="Phone"
            id="phone"
            type="tel"
            placeholder=""
            required
          />
        </div>
        <Button type="button" variant="primary" size="btn-md">Add Person</Button>
        <Button type="submit" variant="primary" size="btn-md">Create</Button>
        <Button type="button" variant="secondary" size="btn-md">Cancel</Button>
      </form>
    </div>
  );
}

export default SignUpForm;
