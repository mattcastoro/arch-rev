import './Alert.css'

function Alert({
  children,
  title = 'Please check the form',
  variant = 'error',
  onDismiss,
}) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      <div className="alert__content">
        <p className="alert__title">{title}</p>
        {children && <p className="alert__message">{children}</p>}
      </div>
      {onDismiss && (
        <button
          className="alert__dismiss"
          type="button"
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          x
        </button>
      )}
    </div>
  )
}

export default Alert
