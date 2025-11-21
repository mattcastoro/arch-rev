import './Button.css'

function Button({ 
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "btn-md",
  className="",
}) {

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${variant} ${size} ${className}`}>
      {children}
    </button>
  );
}

export default Button;