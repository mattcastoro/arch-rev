import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert/Alert'
import Button from '../../components/Button/Button'
import { createRequest, getCurrentUserEmail } from '../../lib/localData'
import '../RequestsNew/RequestsNew.css'

function RequestsNeighbors() {
  const location = useLocation()
  const navigate = useNavigate()
  const { draftImprovements, requestImprovements } = location.state ?? {}
  const isReview = location.pathname.endsWith('/review')
  const [neighbors, setNeighbors] = useState(location.state?.neighbors ?? [{
    id: `neighbor-${Date.now()}-0`,
    fullName: '',
    streetAddress: '',
    email: '',
  }])
  const [noVisibleNeighbors, setNoVisibleNeighbors] = useState(location.state?.noVisibleNeighbors ?? false)
  const [errors, setErrors] = useState({})
  const [alertMessage, setAlertMessage] = useState('')

  if (!requestImprovements || !draftImprovements) {
    return <Navigate to="/requests/new" replace />
  }

  function addNeighbor() {
    setNeighbors((current) => [...current, {
      id: `neighbor-${Date.now()}-${current.length}`,
      fullName: '',
      streetAddress: '',
      email: '',
    }])
    setNoVisibleNeighbors(false)
  }

  function updateNeighbor(id, field, value) {
    setNeighbors((current) => current.map((neighbor) => (
      neighbor.id === id ? { ...neighbor, [field]: value } : neighbor
    )))
    setErrors((current) => ({ ...current, [`${id}-${field}`]: false }))
  }

  function removeNeighbor(id) {
    setNeighbors((current) => current.filter((neighbor) => neighbor.id !== id))
  }

  function validateNeighbors() {
    if (noVisibleNeighbors) return true
    if (!neighbors.length) {
      setAlertMessage('Add at least one neighbor or confirm that no neighboring property can view the project.')
      return false
    }

    const nextErrors = {}
    neighbors.forEach((neighbor) => {
      if (!neighbor.fullName.trim()) nextErrors[`${neighbor.id}-fullName`] = true
      if (!neighbor.streetAddress.trim()) nextErrors[`${neighbor.id}-streetAddress`] = true
      if (!/^\S+@\S+\.\S+$/.test(neighbor.email.trim())) nextErrors[`${neighbor.id}-email`] = true
    })
    setErrors(nextErrors)
    setAlertMessage(Object.keys(nextErrors).length ? 'Please complete the highlighted neighbor fields.' : '')
    return Object.keys(nextErrors).length === 0
  }

  function continueToReview() {
    if (!validateNeighbors()) return
    navigate('/requests/new/review', {
      state: { draftImprovements, requestImprovements, neighbors, noVisibleNeighbors },
    })
  }

  function submitRequest() {
    const ownerEmail = getCurrentUserEmail()
    if (!ownerEmail) {
      navigate('/login')
      return
    }
    createRequest({
      ownerEmail,
      improvements: requestImprovements,
      neighbors: noVisibleNeighbors ? [] : neighbors,
      noVisibleNeighbors,
    })
    navigate('/home')
  }

  return (
    <div className="requests-new-page">
      <header className="requests-new-header">
        <h1>{isReview ? 'Review Request' : 'Neighbor Acknowledgments'}</h1>
        <p>{isReview ? 'Confirm the request before submitting it.' : 'Add neighbors who can view the project from their property.'}</p>
      </header>

      <ol className="requests-new-steps" aria-label="Request progress">
        {['Request details', 'Neighbors', 'Review'].map((label, index) => {
          const currentStep = isReview ? 3 : 2
          return (
            <li key={label} aria-current={currentStep === index + 1 ? 'step' : undefined}>
              <span>{index + 1}</span>{label}
            </li>
          )
        })}
      </ol>

      {alertMessage && <Alert onDismiss={() => setAlertMessage('')}>{alertMessage}</Alert>}

      {!isReview ? (
        <section className="requests-new-section requests-new-neighbors" aria-labelledby="neighbors-heading">
          <h2 id="neighbors-heading">Neighbors</h2>
          <p>Acknowledgment confirms review, not approval.</p>
          {!noVisibleNeighbors && neighbors.map((neighbor, index) => (
            <fieldset className="requests-new-neighbor" key={neighbor.id} aria-label="Neighbor details">
              <button
                className="requests-new-improvement-remove requests-new-neighbor-remove"
                type="button"
                onClick={() => removeNeighbor(neighbor.id)}
                aria-label={`Remove neighbor ${index + 1}`}
              >
                x
              </button>
              <label>Full name<input value={neighbor.fullName} aria-invalid={errors[`${neighbor.id}-fullName`] || undefined} onChange={(event) => updateNeighbor(neighbor.id, 'fullName', event.target.value)} /></label>
              <label>Street address<input value={neighbor.streetAddress} aria-invalid={errors[`${neighbor.id}-streetAddress`] || undefined} onChange={(event) => updateNeighbor(neighbor.id, 'streetAddress', event.target.value)} /></label>
              <label>Email address<input type="email" value={neighbor.email} aria-invalid={errors[`${neighbor.id}-email`] || undefined} onChange={(event) => updateNeighbor(neighbor.id, 'email', event.target.value)} /></label>
            </fieldset>
          ))}
          {!noVisibleNeighbors && <Button type="button" variant="secondary" size="btn-sm" onClick={addNeighbor}>Add Neighbor</Button>}
          <label className="requests-new-attestation">
            <input
              className="checkbox-field"
              type="checkbox"
              checked={noVisibleNeighbors}
              onChange={(event) => {
                setNoVisibleNeighbors(event.target.checked)
                setAlertMessage('')
              }}
            />
            By checking this box, I confirm that no neighboring property can view this project.
          </label>
        </section>
      ) : (
        <section className="requests-new-section requests-new-review" aria-labelledby="review-heading">
          <h2 id="review-heading">Review your request</h2>
          <div><h3>Improvements</h3>{requestImprovements.map((item, index) => <article key={`${item.improvementType}-${index}`}><strong>{item.improvementType}</strong><p>{item.description}</p><small>{item.files.length} file(s) · {item.links.length} link(s)</small></article>)}</div>
          <div><h3>Neighbors</h3>{noVisibleNeighbors ? <p>No neighboring property can view this project.</p> : <ul>{neighbors.map((neighbor) => <li key={neighbor.id}>{neighbor.fullName} · {neighbor.streetAddress} · {neighbor.email}</li>)}</ul>}</div>
        </section>
      )}

      <div className="requests-new-actions">
        <Button type="button" variant="secondary" onClick={() => navigate(isReview ? '/requests/new/neighbors' : '/requests/new', { state: isReview ? { draftImprovements, requestImprovements, neighbors, noVisibleNeighbors } : { draftImprovements } })}>Back</Button>
        {isReview ? <Button type="button" onClick={submitRequest}>Submit Request</Button> : <Button type="button" onClick={continueToReview}>Next: Review Request</Button>}
      </div>
    </div>
  )
}

export default RequestsNeighbors
