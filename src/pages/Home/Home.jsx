import './Home.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { clearSession, getCurrentUserEmail, getRequestsByOwner } from '../../lib/localData'

const tabs = [
  { id: 'requests', label: 'Requests' },
  { id: 'profile', label: 'Profile' },
  { id: 'support', label: 'Support' },
]

function RequestsPanel({ requests, onCreateRequest }) {
  return (
    <section className="home-panel" role="tabpanel" aria-label="Requests">
      <div className="home-panel__header">
        <h2>Requests</h2>
        <button
          type="button"
          className="home-create-request"
          aria-label="Create New Request"
          onClick={onCreateRequest}
        >
          Create New Request
        </button>
      </div>
      {requests.length === 0 ? (
        <article className="home-card">
          <h3>No requests yet</h3>
          <p>Create your first request to begin the architectural review workflow.</p>
        </article>
      ) : (
        <div className="home-grid">
          {requests.map((request) => (
            <article className="home-card" key={request.id}>
              {(request.improvements ?? [request]).map((improvement, index) => (
                <div className="home-card__improvement" key={`${request.id}-${index}`}>
                  <h3>{improvement.improvementType}</h3>
                  <p>{improvement.description}</p>
                  <p className="home-card__meta">Files: {improvement.files.length}</p>
                </div>
              ))}
              <p className="home-card__meta">Status: {request.status}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ProfilePanel() {
  return (
    <section className="home-panel" role="tabpanel" aria-label="Profile">
      <h2>Profile</h2>
      <div className="home-grid">
        <article className="home-card">
          <h3>Primary Resident</h3>
          <p>Name, address, and preferred contact details.</p>
        </article>
        <article className="home-card">
          <h3>Household Members</h3>
          <p>Secondary residents and notification preferences.</p>
        </article>
      </div>
      <article className="home-card">
        <h3>Communication Preferences</h3>
        <p>Choose where review updates are sent and which events trigger notifications.</p>
      </article>
    </section>
  )
}

function SupportPanel() {
  return (
    <section className="home-panel" role="tabpanel" aria-label="Support">
      <h2>Support</h2>
      <div className="home-grid">
        <article className="home-card">
          <h3>Help Topics</h3>
          <p>Common questions about timelines, required documents, and status meanings.</p>
        </article>
        <article className="home-card">
          <h3>Contact the Committee</h3>
          <p>Use this channel for submission-specific help and policy clarifications.</p>
        </article>
      </div>
      <article className="home-card">
        <h3>Technical Support</h3>
        <p>Report account access issues, missing notifications, or upload errors.</p>
      </article>
    </section>
  )
}

function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('requests')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [requests, setRequests] = useState([])
  const [currentEmail, setCurrentEmail] = useState('')

  useEffect(() => {
    const email = getCurrentUserEmail()
    if (!email) return
    setCurrentEmail(email)
    setRequests(getRequestsByOwner(email))
  }, [])

  function handleSelectTab(tabId) {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  function renderActivePanel() {
    if (activeTab === 'profile') return <ProfilePanel />
    if (activeTab === 'support') return <SupportPanel />
    return <RequestsPanel requests={requests} onCreateRequest={() => navigate('/requests/new')} />
  }

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="home-page">
      <header className="home-topbar">
        <div className="home-topbar__brand">
          <h1>Architectural Review Dashboard</h1>
          <p>Manage requests, profile details, and support resources in one place.</p>
          {currentEmail && <p className="home-topbar__user">Signed in as {currentEmail}</p>}
        </div>
        <div className="home-topbar__actions">
          <button
            type="button"
            className={`home-menu-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          <Button
            type="button"
            variant="secondary"
            size="btn-md"
            className="home-desktop-logout"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </header>

      <div className="home-layout">
        <aside className="home-sidebar">
          <nav className="home-tabs" role="tablist" aria-label="Home sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-label={`${tab.label} section`}
                className={`home-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => handleSelectTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="home-content">
          {renderActivePanel()}
        </main>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            className="home-mobile-overlay"
            aria-label="Dismiss navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside id="mobile-navigation-menu" className="home-mobile-drawer">
            <div className="home-mobile-drawer__header">
              <h2>Sections</h2>
            </div>
            <nav className="home-mobile-tabs" role="tablist" aria-label="Mobile home sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={`${tab.label} section`}
                  className={`home-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <Button
              type="button"
              variant="secondary"
              size="btn-sm"
              className="home-mobile-logout"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </aside>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="home-mobile-create">
          <Button
            type="button"
            variant="primary"
            size="btn-md"
            fullWidth
            onClick={() => navigate('/requests/new')}
          >
            Create New Request
          </Button>
        </div>
      )}

    </div>
  )
}

export default Home
