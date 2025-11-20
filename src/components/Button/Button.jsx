import './Button.css'

function Button({ 
  children, 
  onClick, 
  type="button",
  variant = "primary", 
  className="",
}) {

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${variant} ${className}`}>
      {children}
    </button>
  );
}

export default Button;