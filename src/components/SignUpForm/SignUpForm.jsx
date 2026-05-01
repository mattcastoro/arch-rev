import './SignUpForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"

function SignUpForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [people, setPeople] = useState([1])
  const [nextPersonId, setNextPersonId] = useState(2)

  function handleAddPerson() {
    setPeople((currentPeople) => [...currentPeople, nextPersonId])
    setNextPersonId((currentId) => currentId + 1)
  }

  function handleRemovePerson(personIdToRemove) {
    setPeople((currentPeople) => (
      currentPeople.filter((personId) => personId !== personIdToRemove)
    ))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const requiredFields = [
      ['streetAddress', 'Street address'],
      ...people.flatMap((personId, index) => {
        const personLabel = `Person ${index + 1}`

        return [
          [`firstName-${personId}`, `${personLabel} first name`],
          [`lastName-${personId}`, `${personLabel} last name`],
          [`email-${personId}`, `${personLabel} email`],
          [`phone-${personId}`, `${personLabel} phone`],
        ]
      }),
    ]

    const missingFields = requiredFields
      .filter(([name]) => !formData.get(name)?.trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      setAlertMessage(`Please complete: ${missingFields.join(', ')}.`)
      return
    }

    const emailInputs = event.currentTarget.querySelectorAll('input[type="email"]')
    const hasInvalidEmail = Array.from(emailInputs).some((emailInput) => !emailInput.validity.valid)

    if (hasInvalidEmail) {
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
        <div className="people-fields">
          {people.map((personId, index) => (
            <section className="person-fields" key={personId}>
              <div className="person-fields__header">
                <h3 className="person-fields__title">Person {index + 1}</h3>
                {index === 1 && (
                  <button
                    className="person-fields__remove"
                    type="button"
                    aria-label="Remove second person"
                    onClick={() => handleRemovePerson(personId)}
                  >
                    x
                  </button>
                )}
              </div>
              <div className="form-fields">
                <FormField
                  label="First Name"
                  id={`firstName-${personId}`}
                  type="text"
                  placeholder=""
                  required
                />
                <FormField
                  label="Last Name"
                  id={`lastName-${personId}`}
                  type="text"
                  placeholder=""
                  required
                />
              </div>
              <div className="form-fields">
                <FormField
                  label="Email"
                  id={`email-${personId}`}
                  type="email"
                  placeholder=""
                  required
                />
                <FormField
                  label="Phone"
                  id={`phone-${personId}`}
                  type="tel"
                  placeholder=""
                  required
                />
              </div>
            </section>
          ))}
        </div>
        {people.length < 2 && (
          <Button type="button" variant="primary" size="btn-md" onClick={handleAddPerson}>Add Person</Button>
        )}
        <Button type="submit" variant="primary" size="btn-md">Create</Button>
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
  );
}

export default SignUpForm;
