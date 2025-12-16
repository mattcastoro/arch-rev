import './FormField.css'

function FormField({ 
  label,
  id,
  type = "text",
  placeholder = "",
  labelPosition = "left" /* 'top' | 'left' */,
  required = false
 }) {
  return (
    <div className={`field field--${labelPosition}`}>
      <label htmlFor={id} className='label'>
        {label}
        {required && <span className='required'>*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default FormField;