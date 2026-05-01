import './FormField.css'

function FormField({ 
  label,
  id,
  name = id,
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
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default FormField;
