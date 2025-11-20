import './Label.css'

function Label({ text, htmlFor, required }) {
  return (
    <label htmlFor={htmlFor} className='form-label'>
      {text}
      {required && <span className='required'>*</span>}
    </label>
  );
}

export default Label