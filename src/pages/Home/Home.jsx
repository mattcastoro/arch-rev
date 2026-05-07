import './Home.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'

const tabs = [
  { id: 'requests', label: 'Requests' },
  { id: 'profile', label: 'Profile' },
  { id: 'support', label: 'Support' },
]

function RequestsPanel() {
  return (
    <section className="home-panel" role="tabpanel" aria-label="Requests">
      <h2>Requests</h2>
      <div className="home-grid">
        <article className="home-card">
          <h3>Pending Review</h3>
          <p>2 open requests waiting for committee review.</p>
        </article>
        <article className="home-card">
          <h3>Recent Decisions</h3>
          <p>1 request approved in the last 30 days.</p>
        </article>
      </div>
      <article className="home-card">
        <h3>Request Timeline</h3>
        <p>Status updates for each submission will appear here as your project moves from submitted to decisioned.</p>
      </article>
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  function handleSelectTab(tabId) {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  function renderActivePanel() {
    if (activeTab === 'profile') return <ProfilePanel />
    if (activeTab === 'support') return <SupportPanel />
    return <RequestsPanel />
  }

  return (
    <div className="home-page">
      <header className="home-topbar">
        <div className="home-topbar__brand">
          <h1>Architectural Review Dashboard</h1>
          <p>Manage requests, profile details, and support resources in one place.</p>
        </div>
        <div className="home-topbar__actions">
          <Button
            type="button"
            variant="primary"
            size="btn-md"
            className="home-desktop-create"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Request
          </Button>
          <button
            type="button"
            className="home-menu-btn"
            aria-label="Open navigation menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            Menu
          </button>
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
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="home-mobile-drawer">
            <div className="home-mobile-drawer__header">
              <h2>Sections</h2>
              <button
                type="button"
                className="home-mobile-drawer__close"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                x
              </button>
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
          </aside>
        </>
      )}

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

      {isCreateModalOpen && (
        <div className="home-modal-backdrop" role="dialog" aria-modal="true" aria-label="Create request modal">
          <div className="home-modal">
            <div className="home-modal__header">
              <h2>Create New Request</h2>
              <button
                type="button"
                className="home-modal__close"
                aria-label="Close create request modal"
                onClick={() => setIsCreateModalOpen(false)}
              >
                x
              </button>
            </div>
            <div className="home-modal__body">
              <p>A structured request form will appear here in the next iteration.</p>
            </div>
            <div className="home-modal__footer">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setIsCreateModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
