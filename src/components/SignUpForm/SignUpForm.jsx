import './SignUpForm.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from "../Alert/Alert"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import TrashIcon from '../TrashIcon/TrashIcon'
import { createUser, setSession } from '../../lib/localData'

function formatPhoneNumber(value, countryCode) {
  const digits = value.replace(/\D/g, '')

  if (countryCode !== '+1') return digits.slice(0, 15)

  const domesticDigits = digits.slice(0, 10)
  if (domesticDigits.length <= 3) return domesticDigits
  if (domesticDigits.length <= 6) {
    return `${domesticDigits.slice(0, 3)}-${domesticDigits.slice(3)}`
  }
  return `${domesticDigits.slice(0, 3)}-${domesticDigits.slice(3, 6)}-${domesticDigits.slice(6)}`
}

function SignUpForm() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [people, setPeople] = useState([1])
  const [nextPersonId, setNextPersonId] = useState(2)
  const [invalidFields, setInvalidFields] = useState([])
  const [phoneCountryCodes, setPhoneCountryCodes] = useState({ 1: '+1' })

  function handleAddPerson() {
    setPeople((currentPeople) => [...currentPeople, nextPersonId])
    setPhoneCountryCodes((currentCodes) => ({ ...currentCodes, [nextPersonId]: '+1' }))
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
      ['password', 'Password'],
      ...people.flatMap((personId, index) => {
        const personLabel = `Person ${index + 1}`

        return [
          [`firstName-${personId}`, `${personLabel} first name`],
          [`lastName-${personId}`, `${personLabel} last name`],
          [`email-${personId}`, `${personLabel} email`],
          [`phoneCountry-${personId}`, `${personLabel} phone country code`],
          [`phone-${personId}`, `${personLabel} phone`],
        ]
      }),
    ]

    const missingFields = requiredFields
      .filter(([name]) => !formData.get(name)?.trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      setInvalidFields(requiredFields.filter(([name]) => !formData.get(name)?.trim()).map(([name]) => name))
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    const emailInputs = event.currentTarget.querySelectorAll('input[type="email"]')
    const hasInvalidEmail = Array.from(emailInputs).some((emailInput) => !emailInput.validity.valid)

    if (hasInvalidEmail) {
      setInvalidFields(Array.from(emailInputs).filter((emailInput) => !emailInput.validity.valid).map((emailInput) => emailInput.name))
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    const primaryEmail = formData.get(`email-${people[0]}`)?.trim().toLowerCase()
    const password = formData.get('password')?.trim()
    const streetAddress = formData.get('streetAddress')?.trim()
    const residents = people.map((personId, index) => ({
      id: personId,
      role: index === 0 ? 'Primary' : 'Secondary',
      firstName: formData.get(`firstName-${personId}`)?.trim(),
      lastName: formData.get(`lastName-${personId}`)?.trim(),
      email: formData.get(`email-${personId}`)?.trim().toLowerCase(),
      phoneCountryCode: formData.get(`phoneCountry-${personId}`)?.trim(),
      phone: formData.get(`phone-${personId}`)?.trim(),
    }))

    const createUserResult = createUser({
      email: primaryEmail,
      password,
      streetAddress,
      residents,
    })

    if (!createUserResult.ok) {
      setInvalidFields([`email-${people[0]}`])
      setAlertMessage(createUserResult.message)
      return
    }

    setSession(primaryEmail)
    setInvalidFields([])
    setAlertMessage('')
    navigate('/home')
  }

  return (
    <div className='signUp-container'>
      <form className="signUp-form" noValidate onSubmit={handleSubmit}>
        {alertMessage && (
          <Alert onDismiss={() => { setAlertMessage(''); setInvalidFields([]) }}>
            {alertMessage}
          </Alert>
        )}
        <FormField
          label="Street Address"
          id="streetAddress"
          type="text"
          required
          invalid={invalidFields.includes('streetAddress')}
        />
        <FormField
          label="Create Password"
          id="password"
          type="password"
          required
          invalid={invalidFields.includes('password')}
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
                    <TrashIcon />
                  </button>
                )}
              </div>
              <div className="form-fields">
                <FormField
                  label="First Name"
                  id={`firstName-${personId}`}
                  type="text"
                  required
                  invalid={invalidFields.includes(`firstName-${personId}`)}
                />
                <FormField
                  label="Last Name"
                  id={`lastName-${personId}`}
                  type="text"
                  required
                  invalid={invalidFields.includes(`lastName-${personId}`)}
                />
              </div>
              <div className="form-fields">
                <FormField
                  label="Email"
                  id={`email-${personId}`}
                  type="email"
                  required
                  invalid={invalidFields.includes(`email-${personId}`)}
                />
                <div className="phone-fields">
                  <input
                    className={invalidFields.includes(`phoneCountry-${personId}`) ? 'field__control--invalid' : undefined}
                    name={`phoneCountry-${personId}`}
                    type="tel"
                    inputMode="tel"
                    aria-label="Country code*"
                    title="Country code (USA/Canada defaults to +1)"
                    placeholder="+1"
                    required
                    value={phoneCountryCodes[personId]}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, '').slice(0, 3)
                      setPhoneCountryCodes((currentCodes) => ({
                        ...currentCodes,
                        [personId]: digits ? `+${digits}` : '',
                      }))
                    }}
                  />
                  <FormField
                    label="Phone"
                    id={`phone-${personId}`}
                    type="tel"
                    inputMode="tel"
                    placeholder="Phone number"
                    required
                    invalid={invalidFields.includes(`phone-${personId}`)}
                    onChange={(event) => {
                      event.currentTarget.value = formatPhoneNumber(
                        event.currentTarget.value,
                        phoneCountryCodes[personId],
                      )
                    }}
                  />
                </div>
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
