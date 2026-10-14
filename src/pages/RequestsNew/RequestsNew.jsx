import '../../App.css'
import { useEffect, useRef, useState } from 'react'
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

const uploadDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const fileSizeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
})
const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png']
const maximumFileSize = 10_000_000
const maximumFiles = 10

function formatFileSize(size) {
  if (size < 1_000_000) return `${fileSizeFormatter.format(size / 1_000)} KB`
  return `${fileSizeFormatter.format(size / 1_000_000)} MB`
}

function getFileValidationError(file) {
  if (!allowedFileTypes.includes(file.type)) return `“${file.name}” wasn’t added. Upload a PDF, JPG, or PNG.`
  if (file.size === 0) return `“${file.name}” appears to be empty or unreadable. Upload the file again.`
  if (file.size > maximumFileSize) return `“${file.name}” is ${formatFileSize(file.size)}. The maximum file size is 10 MB.`
  return ''
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm10-12 3 3" />
    </svg>
  )
}

function RequestsNew() {
  const navigate = useNavigate()
  const [alertMessage, setAlertMessage] = useState('')
  const [invalidFields, setInvalidFields] = useState([])
  const [improvements, setImprovements] = useState([{ id: 0, files: [], links: [] }])
  const [attachmentMenuId, setAttachmentMenuId] = useState(null)
  const [linkEditorId, setLinkEditorId] = useState(null)
  const [linkDrafts, setLinkDrafts] = useState({})
  const [linkDescriptionDrafts, setLinkDescriptionDrafts] = useState({})
  const [editingLink, setEditingLink] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [attachmentErrors, setAttachmentErrors] = useState({})
  const [duplicateFile, setDuplicateFile] = useState(null)
  const [desktopCameraPromptId, setDesktopCameraPromptId] = useState(null)
  const [fileToRemove, setFileToRemove] = useState(null)
  const [linkToRemove, setLinkToRemove] = useState(null)
  const [improvementToRemove, setImprovementToRemove] = useState(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const nextImprovementId = useRef(1)
  const uploadTimers = useRef(new Map())
  const previewUrl = useRef(null)

  useEffect(() => () => {
    uploadTimers.current.forEach((timer) => clearTimeout(timer))
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
  }, [])

  useEffect(() => {
    function closeAttachmentMenuOnOutsideClick(event) {
      if (!event.target.closest('.requests-new-attachment-menu-wrapper')) {
        setAttachmentMenuId(null)
      }
    }

    if (attachmentMenuId !== null) {
      document.addEventListener('mousedown', closeAttachmentMenuOnOutsideClick)
    }

    return () => document.removeEventListener('mousedown', closeAttachmentMenuOnOutsideClick)
  }, [attachmentMenuId])

  function openFilePreview(file) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    const url = URL.createObjectURL(file)
    previewUrl.current = url
    setFilePreview({ file, url })
  }

  function closeFilePreview() {
    URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = null
    setFilePreview(null)
  }

  function getImprovementValues(form, improvement) {
    const formData = new FormData(form)
    const { id, files, links } = improvement

    return {
      improvementType: formData.get(`improvementType-${id}`)?.toString() || '',
      description: formData.get(`description-${id}`)?.toString().trim() || '',
      files,
      links,
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
    setImprovements((current) => [...current, { id, files: [], links: [] }])
  }

  function openFilePicker(id, inputType) {
    document.getElementById(`${inputType}-${id}`).click()
    setAttachmentMenuId(null)
  }

  function showLinkEditor(id) {
    setEditingLink(null)
    setLinkEditorId(id)
    setAttachmentMenuId(null)
  }

  function handleTakePhoto(id) {
    if (window.innerWidth < 768) {
      openFilePicker(id, 'cameraPhoto')
      return
    }

    setAttachmentMenuId(null)
    setDesktopCameraPromptId(id)
  }

  function continueWithDesktopPhoto() {
    const id = desktopCameraPromptId
    setDesktopCameraPromptId(null)
    openFilePicker(id, 'cameraPhoto')
  }

  function cancelLinkEditor(id) {
    setLinkDrafts((current) => ({ ...current, [id]: '' }))
    setLinkDescriptionDrafts((current) => ({ ...current, [id]: '' }))
    setLinkEditorId(null)
    setEditingLink(null)
    setAlertMessage('')
    setAttachmentErrors((current) => ({ ...current, [id]: '' }))
  }

  function addLink(id) {
    const url = (linkDrafts[id] || '').trim()
    const description = (linkDescriptionDrafts[id] || '').trim()
    if (!/^https?:\/\//i.test(url)) {
      setAlertMessage('Enter a valid website link beginning with http:// or https://.')
      return
    }

    const improvement = improvements.find((item) => item.id === id)
    if (improvement.links.some((link, index) => (
      link.url.toLowerCase() === url.toLowerCase() && index !== editingLink?.linkIndex
    ))) {
      setAttachmentErrors((current) => ({ ...current, [id]: 'This website link has already been added.' }))
      return
    }

    setImprovements((current) => current.map((currentImprovement) => {
      if (currentImprovement.id !== id) return currentImprovement

      if (editingLink) {
        const links = [...currentImprovement.links]
        links[editingLink.linkIndex] = {
          ...links[editingLink.linkIndex],
          url,
          description,
        }
        return { ...currentImprovement, links }
      }

      return {
        ...currentImprovement,
        links: [...currentImprovement.links, { url, description, addedAt: new Date() }],
      }
    }))
    setLinkDrafts((current) => ({ ...current, [id]: '' }))
    setLinkDescriptionDrafts((current) => ({ ...current, [id]: '' }))
    setLinkEditorId(null)
    setEditingLink(null)
    setAlertMessage('')
    setAttachmentErrors((current) => ({ ...current, [id]: '' }))
  }

  function editLink(id, linkIndex, link) {
    setLinkDrafts((current) => ({ ...current, [id]: link.url }))
    setLinkDescriptionDrafts((current) => ({ ...current, [id]: link.description || '' }))
    setEditingLink({ id, linkIndex })
    setLinkEditorId(id)
    setAttachmentErrors((current) => ({ ...current, [id]: '' }))
  }

  function removeLink(id, linkIndex) {
    setImprovements((current) => {
      const improvementIndex = current.findIndex((improvement) => improvement.id === id)
      const nextImprovements = [...current]
      const improvement = nextImprovements[improvementIndex]
      nextImprovements[improvementIndex] = {
        ...improvement,
        links: [
          ...improvement.links.slice(0, linkIndex),
          ...improvement.links.slice(linkIndex + 1),
        ],
      }
      return nextImprovements
    })
    setLinkToRemove(null)
  }

  function handleFilesSelected(event, id) {
    const uploadedAt = new Date()
    const improvement = improvements.find((item) => item.id === id)
    const selectedFiles = Array.from(event.currentTarget.files)
    const validFiles = selectedFiles.filter((file) => {
      const error = getFileValidationError(file)
      if (error) setAttachmentErrors((current) => ({ ...current, [id]: error }))
      return !error
    })
    const availableSlots = maximumFiles - improvement.files.length
    const filesWithinLimit = validFiles.slice(0, availableSlots)
    if (validFiles.length > availableSlots) {
      setAttachmentErrors((current) => ({ ...current, [id]: 'You can attach up to 10 files to this improvement.' }))
    }
    const newFiles = filesWithinLimit.flatMap((file) => {
      const existingIndex = improvement.files.findIndex(
        (entry) => entry.file.name.toLowerCase() === file.name.toLowerCase(),
      )
      if (existingIndex >= 0) {
        setDuplicateFile({ id, file, uploadedAt, existingIndex })
        return []
      }
      return [{ file, uploadedAt, uploading: true }]
    })
    setImprovements((current) => current.map((improvement) => (
      improvement.id === id
        ? { ...improvement, files: [...improvement.files, ...newFiles] }
        : improvement
    )))
    event.currentTarget.value = ''

    if (!newFiles.length) return
    if (validFiles.length === selectedFiles.length && validFiles.length <= availableSlots) {
      setAttachmentErrors((current) => ({ ...current, [id]: '' }))
    }
    clearTimeout(uploadTimers.current.get(id))
    const timer = setTimeout(() => {
      setImprovements((current) => {
        const improvementIndex = current.findIndex((improvement) => improvement.id === id)
        const nextImprovements = [...current]
        const improvement = nextImprovements[improvementIndex]
        nextImprovements[improvementIndex] = {
          ...improvement,
          files: improvement.files.map((fileEntry) => ({ ...fileEntry, uploading: false })),
        }
        return nextImprovements
      })
      uploadTimers.current.delete(id)
    }, 700)
    uploadTimers.current.set(id, timer)
  }

  function replaceDuplicateFile() {
    const { id, file, uploadedAt, existingIndex } = duplicateFile
    setImprovements((current) => {
      const improvementIndex = current.findIndex((improvement) => improvement.id === id)
      const nextImprovements = [...current]
      const improvement = nextImprovements[improvementIndex]
      const files = [...improvement.files]
      files[existingIndex] = { file, uploadedAt, uploading: false }
      nextImprovements[improvementIndex] = { ...improvement, files }
      return nextImprovements
    })
    setDuplicateFile(null)
    setAttachmentErrors((current) => ({ ...current, [id]: '' }))
  }

  function removeFile(id, fileIndex) {
    setImprovements((current) => {
      const improvementIndex = current.findIndex((improvement) => improvement.id === id)
      const nextImprovements = [...current]
      const improvement = nextImprovements[improvementIndex]
      nextImprovements[improvementIndex] = {
        ...improvement,
        files: [
          ...improvement.files.slice(0, fileIndex),
          ...improvement.files.slice(fileIndex + 1),
        ],
      }
      return nextImprovements
    })
    setFileToRemove(null)
  }

  function removeImprovement(id) {
    clearTimeout(uploadTimers.current.get(id))
    uploadTimers.current.delete(id)
    setImprovements((current) => current.filter((improvement) => improvement.id !== id))
    setInvalidFields((current) => current.filter((field) => !field.endsWith(`-${id}`)))
    setImprovementToRemove(null)
  }

  function handleRemoveImprovement(event, improvement) {
    const improvementValues = getImprovementValues(event.currentTarget.form, improvement)
    const hasEnteredData = Boolean(
      improvementValues.improvementType
      || improvementValues.description
      || improvementValues.files.length
      || improvementValues.links.length,
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
        || improvementValues.links.length
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
        files: improvementValues.files.map(({ file }) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        links: improvementValues.links.map(({ url, description, addedAt }) => ({
          url,
          description,
          addedAt: addedAt.toISOString(),
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

  function renderLinkEditor(id, improvementIndex) {
    return (
      <div className="requests-new-link-editor">
        <input
          type="url"
          aria-label={`Website Link ${improvementIndex + 1}`}
          placeholder="https://example.com"
          value={linkDrafts[id] || ''}
          onChange={(event) => setLinkDrafts((current) => ({
            ...current,
            [id]: event.target.value,
          }))}
        />
        <input
          type="text"
          aria-label={`Link Description ${improvementIndex + 1}`}
          placeholder="Description (optional)"
          maxLength={100}
          value={linkDescriptionDrafts[id] || ''}
          onChange={(event) => setLinkDescriptionDrafts((current) => ({
            ...current,
            [id]: event.target.value,
          }))}
        />
        <div className="requests-new-link-editor-actions">
          <button className="requests-new-link-cancel" type="button" onClick={() => cancelLinkEditor(id)}>
            Cancel
          </button>
          <button className="requests-new-link-add" type="button" onClick={() => addLink(id)}>
            {editingLink?.id === id ? 'Save Link' : 'Add Link'}
          </button>
        </div>
      </div>
    )
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
            const { id, files, links } = improvement

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

              <div className="field requests-new-upload">
                <div className="requests-new-attachment-actions">
                  <div className="requests-new-attachment-menu-wrapper">
                    <button
                      className="requests-new-attachment-trigger"
                      type="button"
                      aria-expanded={attachmentMenuId === id}
                      aria-haspopup="menu"
                      onClick={() => setAttachmentMenuId(attachmentMenuId === id ? null : id)}
                    >
                      Add attachment <span aria-hidden="true">▾</span>
                    </button>
                    {attachmentMenuId === id && (
                      <div className="requests-new-attachment-menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => openFilePicker(id, 'supportingDocs')}>
                          Upload from device
                        </button>
                        <button type="button" role="menuitem" onClick={() => showLinkEditor(id)}>
                          Add website link
                        </button>
                        <button type="button" role="menuitem" onClick={() => handleTakePhoto(id)}>
                          Take a photo
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="requests-new-upload-guidance">
                    PDF, JPG, or PNG · Max 10MB per file · Up to 10 files
                  </span>
                </div>
                <input
                  id={`supportingDocs-${id}`}
                  name={`supportingDocs-${id}`}
                  type="file"
                  className="requests-new-file-input"
                  aria-label={`Supporting Documentation ${index + 1}`}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  multiple
                  onChange={(event) => handleFilesSelected(event, id)}
                />
                <input
                  id={`cameraPhoto-${id}`}
                  type="file"
                  className="requests-new-file-input"
                  aria-label={`Take Photo ${index + 1}`}
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleFilesSelected(event, id)}
                />
                {linkEditorId === id && !editingLink && renderLinkEditor(id, index)}
                {attachmentErrors[id] && (
                  <div className="requests-new-attachment-error" role="alert">
                    <span>{attachmentErrors[id]}</span>
                    <button
                      type="button"
                      aria-label={`Dismiss attachment error ${index + 1}`}
                      onClick={() => setAttachmentErrors((current) => ({ ...current, [id]: '' }))}
                    >
                      ×
                    </button>
                  </div>
                )}
                {files.length > 0 && (
                  <ul className="requests-new-file-list" aria-label={`Selected files ${index + 1}`}>
                    {files.map(({ file, uploadedAt, uploading }, fileIndex) => (
                      <li
                        className="requests-new-file"
                        key={`${file.name}-${file.size}-${fileIndex}`}
                      >
                        <span className="requests-new-file-information">
                          <button
                            className="requests-new-file-name requests-new-file-preview"
                            type="button"
                            onClick={() => openFilePreview(file)}
                          >
                            {file.name}
                          </button>
                          {uploading ? (
                            <span className="requests-new-file-uploading" aria-live="polite">
                              <span className="requests-new-file-uploading-label">Uploading…</span>
                              <span
                                className="requests-new-upload-progress-track"
                                role="progressbar"
                                aria-label={`Uploading ${file.name}`}
                              >
                                <span className="requests-new-upload-progress-bar" />
                              </span>
                            </span>
                          ) : (
                            <span className="requests-new-file-details">
                              {uploadDateFormatter.format(uploadedAt)} · {formatFileSize(file.size)}
                            </span>
                          )}
                        </span>
                        <button
                          className="requests-new-file-remove"
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => setFileToRemove({ id, fileIndex, name: file.name })}
                        >
                          <TrashIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {links.length > 0 && (
                  <ul className="requests-new-file-list" aria-label={`Added links ${index + 1}`}>
                    {links.map(({ url, description, addedAt }, linkIndex) => (
                      editingLink?.id === id && editingLink.linkIndex === linkIndex ? (
                        <li className="requests-new-link-edit-row" key={`${url}-${linkIndex}`}>
                          {renderLinkEditor(id, index)}
                        </li>
                      ) : (
                      <li className="requests-new-file" key={`${url}-${linkIndex}`}>
                        <span className="requests-new-file-information">
                          <a className="requests-new-file-name" href={url} target="_blank" rel="noreferrer">
                            {description || url}
                          </a>
                          <span className="requests-new-file-details">{uploadDateFormatter.format(addedAt)}</span>
                        </span>
                        <span className="requests-new-link-actions">
                          <button
                            className="requests-new-link-edit"
                            type="button"
                            aria-label={`Edit ${url}`}
                            onClick={() => editLink(id, linkIndex, { url, description })}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            className="requests-new-file-remove"
                            type="button"
                            aria-label={`Remove ${url}`}
                            onClick={() => setLinkToRemove({ id, linkIndex, url, description })}
                          >
                            <TrashIcon />
                          </button>
                        </span>
                      </li>
                      )
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

      {filePreview && (
        <div className="requests-new-modal-backdrop requests-new-preview-backdrop" role="presentation">
          <div
            className="requests-new-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
          >
            <header className="requests-new-preview-header">
              <h2 id="file-preview-title">{filePreview.file.name}</h2>
              <button type="button" aria-label="Close file preview" onClick={closeFilePreview}>×</button>
            </header>
            <div className="requests-new-preview-content">
              {filePreview.file.type.startsWith('image/') ? (
                <img src={filePreview.url} alt={`Preview of ${filePreview.file.name}`} />
              ) : (
                <iframe src={filePreview.url} title={`Preview of ${filePreview.file.name}`} />
              )}
            </div>
            <footer className="requests-new-preview-footer">
              <a href={filePreview.url} target="_blank" rel="noreferrer">Open in new tab</a>
            </footer>
          </div>
        </div>
      )}

      {duplicateFile && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="duplicate-file-title">
            <h2 id="duplicate-file-title">Replace existing file?</h2>
            <p>A file named “{duplicateFile.file.name}” has already been added. Would you like to replace it?</p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setDuplicateFile(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="btn-md" onClick={replaceDuplicateFile}>
                Replace File
              </Button>
            </div>
          </div>
        </div>
      )}

      {desktopCameraPromptId !== null && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="desktop-camera-title">
            <h2 id="desktop-camera-title">Camera Capture</h2>
            <p>Taking a photo is only available when using this form on a phone. On this device, continuing will let you select an existing file instead.</p>
            <p>Would you like to continue?</p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setDesktopCameraPromptId(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="btn-md" onClick={continueWithDesktopPhoto}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {fileToRemove && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="delete-file-title">
            <h2 id="delete-file-title">Delete file?</h2>
            <p>Are you sure you want to delete “{fileToRemove.name}”?</p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setFileToRemove(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="btn-md"
                onClick={() => removeFile(fileToRemove.id, fileToRemove.fileIndex)}
              >
                Delete File
              </Button>
            </div>
          </div>
        </div>
      )}

      {linkToRemove && (
        <div className="requests-new-modal-backdrop" role="presentation">
          <div className="requests-new-modal" role="dialog" aria-modal="true" aria-labelledby="delete-link-title">
            <h2 id="delete-link-title">Delete link?</h2>
            <p>
              Are you sure you want to delete “{linkToRemove.description || linkToRemove.url}”?
            </p>
            <div className="requests-new-modal-actions">
              <Button type="button" variant="secondary" size="btn-md" onClick={() => setLinkToRemove(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="btn-md"
                onClick={() => removeLink(linkToRemove.id, linkToRemove.linkIndex)}
              >
                Delete Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsNew
