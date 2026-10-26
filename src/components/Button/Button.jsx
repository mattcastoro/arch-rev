import './Button.css'

function Button({ 
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "btn-md",
  fullWidth = false,
  className="",
  autoFocus = false,
}) {

  return (
    <button
      type={type}
      onClick={onClick}
      autoFocus={autoFocus}
      className={`
        btn
        ${variant}
        ${size}
        ${fullWidth ? "fullWidth" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
