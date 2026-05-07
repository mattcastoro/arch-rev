import '../../App.css'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import './RequestsNew.css'

function RequestsNew() {
  const navigate = useNavigate()

  return (
    <div className="requests-new-page">
      <header className="requests-new-header">
        <h1>Create New Request</h1>
        <p>Use this guided form to submit a new architectural review request.</p>
      </header>

      <section className="requests-new-section">
        <h2>Project Details</h2>
        <p>Project type, summary, and expected start date fields will be added here.</p>
      </section>

      <section className="requests-new-section">
        <h2>Documents</h2>
        <p>Upload slots for plans, photos, and contractor estimates will appear here.</p>
      </section>

      <section className="requests-new-section">
        <h2>Review & Submit</h2>
        <p>Confirmation and final submission controls will appear here.</p>
      </section>

      <div className="requests-new-actions">
        <Button type="button" variant="secondary" size="btn-md" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default RequestsNew
