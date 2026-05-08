import '../../App.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import FormField from '../../components/FormField/FormField'
import { createRequest, getCurrentUserEmail } from '../../lib/localData'
import './RequestsNew.css'

const improvementOptions = [
  { label: 'Paint', value: 'Paint' },
  { label: 'Fence', value: 'Fence' },
  { label: 'Landscaping', value: 'Landscaping' },
]

function RequestsNew() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const ownerEmail = getCurrentUserEmail()
    if (!ownerEmail) {
      setAlertMessage('Please log in before creating a request.')
      navigate('/login')
      return
    }

    const formData = new FormData(event.currentTarget)
    const improvementType = formData.get('improvementType')?.toString()
    const description = formData.get('description')?.toString().trim()
    const selectedFiles = event.currentTarget.elements.supportingDocs.files

    if (!improvementType || !description) {
      setAlertMessage('Improvement type and description are required.')
      return
    }

    const files = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }))

    createRequest({
      ownerEmail,
      improvementType,
      description,
      files,
    })

    setAlertMessage('')
    navigate('/home')
  }

  return (
    <div className="requests-new-page">
      <header className="requests-new-header">
        <h1>Create New Request</h1>
        <p>Use this form to submit your improvement details for local workflow testing.</p>
      </header>

      <form className="requests-new-form" noValidate onSubmit={handleSubmit}>
        {alertMessage && (
          <Alert onDismiss={() => setAlertMessage('')}>
            {alertMessage}
          </Alert>
        )}

        <FormField
          as="select"
          label="Improvement Type"
          id="improvementType"
          options={improvementOptions}
          required
        />

        <FormField
          as="textarea"
          label="Description"
          id="description"
          placeholder="Describe the planned improvement and any important project details."
          rows={6}
          required
        />

        <div className="field field--left">
          <label htmlFor="supportingDocs" className="label">
            Supporting Documentation
          </label>
          <input id="supportingDocs" name="supportingDocs" type="file" multiple />
        </div>

        <div className="requests-new-actions">
          <Button type="button" variant="secondary" size="btn-md" onClick={() => navigate('/home')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="btn-md">
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RequestsNew
