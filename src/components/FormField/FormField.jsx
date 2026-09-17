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
  invalid = false,
}) {
  const fieldPlaceholder = `${placeholder || label}${required ? ' *' : ''}`
  const accessibleLabel = required ? `${label}*` : label

  return (
    <div className={`field field--${labelPosition}`}>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          aria-label={accessibleLabel}
          aria-invalid={invalid || undefined}
          className={invalid ? 'field__control--invalid' : undefined}
          placeholder={fieldPlaceholder}
          required={required}
          rows={rows}
        />
      ) : null}
      {as === 'select' ? (
        <select
          id={id}
          name={name}
          aria-label={accessibleLabel}
          aria-invalid={invalid || undefined}
          className={invalid ? 'field__control--invalid' : undefined}
          required={required}
          defaultValue=""
        >
          <option value="" disabled>{fieldPlaceholder}</option>
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
          aria-label={accessibleLabel}
          aria-invalid={invalid || undefined}
          className={invalid ? 'field__control--invalid' : undefined}
          placeholder={fieldPlaceholder}
          required={required}
        />
      ) : null}
    </div>
  );
}

export default FormField;
