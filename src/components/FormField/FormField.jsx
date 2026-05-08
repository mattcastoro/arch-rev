import './FormField.css'

function FormField({ 
  label,
  id,
  name = id,
  type = "text",
  placeholder = "",
  labelPosition = "left" /* 'top' | 'left' */,
  required = false,
  as = 'input',
  options = [],
  rows = 4,
}) {
  return (
    <div className={`field field--${labelPosition}`}>
      <label htmlFor={id} className='label'>
        {label}
        {required && <span className='required'>*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      ) : null}
      {as === 'select' ? (
        <select id={id} name={name} required={required} defaultValue="">
          <option value="" disabled>Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : null}
      {as === 'input' ? (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
        />
      ) : null}
    </div>
  );
}

export default FormField;
