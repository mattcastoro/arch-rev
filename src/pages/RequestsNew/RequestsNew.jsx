import '../../App.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import FormField from '../../components/FormField/FormField'
import { createRequest, getCurrentUserEmail } from '../../lib/localData'
import './RequestsNew.css'

const improvementOptions = [
  { label: 'Painting', value: 'Painting' },
  { label: 'Fencing', value: 'Fencing' },
  { label: 'Landscaping', value: 'Landscaping' },
  { label: 'Roofing', value: 'Roofing' },
  { label: 'Windows', value: 'Windows' },
  { label: 'Doors', value: 'Doors' },
  { label: 'Decking', value: 'Decking' },
  { label: 'Patio', value: 'Patio' },
  { label: 'Mailbox', value: 'Mailbox' },
  { label: 'HVAC', value: 'HVAC' },
  { label: 'Lighting', value: 'Lighting' },
  { label: 'Other', value: 'Other' },
]

function RequestsNew() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [invalidFields, setInvalidFields] = useState([])
  const [improvements, setImprovements] = useState([{ id: 0 }])

  function handleSubmit(event) {
    event.preventDefault()

    const ownerEmail = getCurrentUserEmail()
    if (!ownerEmail) {
      setAlertMessage('Please log in before creating a request.')
      navigate('/login')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const requestImprovements = improvements.map(({ id }) => {
      const improvementType = formData.get(`improvementType-${id}`)?.toString()
      const description = formData.get(`description-${id}`)?.toString().trim()
      const selectedFiles = form.elements[`supportingDocs-${id}`].files

      return {
        improvementType,
        description,
        files: Array.from(selectedFiles).map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      }
    })

    const nextInvalidFields = requestImprovements.flatMap((improvement, index) => [
      ...(!improvement.improvementType ? [`improvementType-${improvements[index].id}`] : []),
      ...(!improvement.description ? [`description-${improvements[index].id}`] : []),
    ])

    if (nextInvalidFields.length > 0) {
      setInvalidFields(nextInvalidFields)
      setAlertMessage('Please complete the highlighted fields.')
      return
    }

    createRequest({
      ownerEmail,
      improvements: requestImprovements,
    })

    setAlertMessage('')
    setInvalidFields([])
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
          <Alert onDismiss={() => { setAlertMessage(''); setInvalidFields([]) }}>
            {alertMessage}
          </Alert>
        )}

        <div className="requests-new-improvements">
          {improvements.map(({ id }, index) => (
            <section className="requests-new-improvement" key={id} aria-label={`Improvement ${index + 1}`}>
              <FormField
                as="select"
                label="Improvement Type"
                ariaLabel={`Improvement Type ${index + 1}`}
                id={`improvementType-${id}`}
                options={improvementOptions}
                required
                invalid={invalidFields.includes(`improvementType-${id}`)}
              />

              <FormField
                as="textarea"
                label="Description"
                ariaLabel={`Description ${index + 1}`}
                placeholder="Describe Improvement"
                id={`description-${id}`}
                rows={6}
                required
                invalid={invalidFields.includes(`description-${id}`)}
              />

              <div className="field field--left">
                <input
                  id={`supportingDocs-${id}`}
                  name={`supportingDocs-${id}`}
                  type="file"
                  aria-label={`Supporting Documentation ${index + 1}`}
                  multiple
                />
              </div>
            </section>
          ))}
        </div>

        <div className="requests-new-add-improvement">
          <Button
            type="button"
            variant="secondary"
            size="btn-sm"
            onClick={() => setImprovements((current) => [...current, { id: current.length }])}
          >
            Add Improvement
          </Button>
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
