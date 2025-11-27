import './FormField.css'

function FormField({ 
  label,
  id,
  type = "text",
  placeholder = "",
  required = false
 }) {
  return (
    <div className='field'>
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