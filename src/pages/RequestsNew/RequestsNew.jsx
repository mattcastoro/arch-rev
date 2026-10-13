import '../../App.css'
import { useRef, useState } from 'react'
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
  const [improvements, setImprovements] = useState([{ id: 0, files: [] }])
  const [improvementToRemove, setImprovementToRemove] = useState(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const nextImprovementId = useRef(1)

  function getImprovementValues(form, improvement) {
    const formData = new FormData(form)
    const { id, files } = improvement

    return {
      improvementType: formData.get(`improvementType-${id}`)?.toString() || '',
      description: formData.get(`description-${id}`)?.toString().trim() || '',
      files,
    }
  }

  function validateImprovements(form) {
    const nextInvalidFields = improvements.flatMap((improvement) => {
      const { id } = improvement
      const improvementValues = getImprovementValues(form, improvement)

      return [
        ...(!improvementValues.improvementType ? [`improvementType-${id}`] : []),
        ...(!improvementValues.description ? [`description-${id}`] : []),
      ]
    })

    setInvalidFields(nextInvalidFields)
    setAlertMessage(nextInvalidFields.length ? 'Please complete the highlighted fields.' : '')
    return nextInvalidFields.length === 0
  }

  function handleAddImprovement(event) {
    if (!validateImprovements(event.currentTarget.form)) return

    const id = nextImprovementId.current
    nextImprovementId.current += 1
    setImprovements((current) => [...current, { id, files: [] }])
  }

  function handleFilesSelected(event, id) {
    const selectedFiles = Array.from(event.currentTarget.files)
    setImprovements((current) => current.map((improvement) => (
      improvement.id === id
        ? { ...improvement, files: [...improvement.files, ...selectedFiles] }
        : improvement
    )))
    event.currentTarget.value = ''
  }

  function removeImprovement(id) {
    setImprovements((current) => current.filter((improvement) => improvement.id !== id))
    setInvalidFields((current) => current.filter((field) => !field.endsWith(`-${id}`)))
    setImprovementToRemove(null)
  }

  function handleRemoveImprovement(event, improvement) {
    const improvementValues = getImprovementValues(event.currentTarget.form, improvement)
    const hasEnteredData = Boolean(
      improvementValues.improvementType
      || improvementValues.description
      || improvementValues.files.length,
    )

    if (hasEnteredData) {
      setImprovementToRemove(improvement.id)
      return
    }

    removeImprovement(improvement.id)
  }

  function handleCancelRequest(event) {
    const form = event.currentTarget.form
    const hasEnteredData = improvements.some((improvement) => {
      const improvementValues = getImprovementValues(form, improvement)
      return improvementValues.improvementType
        || improvementValues.description
        || improvementValues.files.length
    })

    if (hasEnteredData || improvements.length > 1) {
      setShowCancelConfirmation(true)
      return
    }

    navigate('/home')
  }

  function handleSubmit(event) {
    event.preventDefault()

    const ownerEmail = getCurrentUserEmail()
    if (!ownerEmail) {
      setAlertMessage('Please log in before creating a request.')
      navigate('/login')
      return
    }

    const form = event.currentTarget
    const requestImprovements = improvements.map((improvement) => {
      const improvementValues = getImprovementValues(form, improvement)

      return {
        improvementType: improvementValues.improvementType,
        description: improvementValues.description,
        files: improvementValues.files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      }
    })

    if (!validateImprovements(form)) return

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
          {improvements.map((improvement, index) => {
            const { id, files } = improvement

            return (
            <section className="requests-new-improvement" key={id} aria-label={`Improvement ${index + 1}`}>
              <div className="requests-new-improvement-header">
                {index > 0 && (
                  <button
                    className="requests-new-improvement-remove"
                    type="button"
                    aria-label={`Remove improvement ${index + 1}`}
                    onClick={(event) => handleRemoveImprovement(event, improvement)}
                  >
                    x
                  </button>
                )}
                <FormField
                  as="select"
                  label="Improvement Type"
                  ariaLabel={`Improvement Type ${index + 1}`}
                  id={`improvementType-${id}`}
                  options={improvementOptions}
                  required
                  invalid={invalidFields.includes(`improvementType-${id}`)}
                />
              </div>

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
                  onChange={(event) => handleFilesSelected(event, id)}
                />
                {files.length > 0 && (
                  <ul className="requests-new-file-list" aria-label={`Selected files ${index + 1}`}>
                    {files.map((file, fileIndex) => (
                      <li key={`${file.name}-${file.size}-${fileIndex}`}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
            )
          })}
        </div>

        <div className="requests-new-add-improvement">
          <Button
            type="button"
            variant="secondary"
            size="btn-sm"
            onClick={handleAddImprovement}
          >
            Add Improvement
          </Button>
        </div>

        <div className="requests-new-actions">
          <Button type="button" variant="secondary" size="btn-md" onClick={handleCancelRequest}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="btn-md">
            Submit Request
          </Button>
        </div>
      </form>

      {improvementToRemove !== null && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="remove-improvement-title">
            <h2 id="remove-improvement-title">Delete improvement?</h2>
            <p>Any information entered for this improvement will be lost.</p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setImprovementToRemove(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="btn-md" onClick={() => removeImprovement(improvementToRemove)}>
                Delete Improvement
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirmation && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-request-title">
            <h2 id="cancel-request-title">Cancel new request?</h2>
            <p>Your entered information will not be saved.</p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setShowCancelConfirmation(false)}>
                Continue Editing
              </Button>
              <Button type="button" variant="primary" size="btn-md" onClick={() => navigate('/home')}>
                Discard Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsNew
