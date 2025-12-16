import './SignUpForm.css'
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import Paragraph from "../Paragraph/Paragraph"

function SignUpForm() {
  return (
    <div className='signUp-container'>
      <form className="signUp-form">
        <FormField
          label="Street Address"
          id="streetAddress"
          type="text"
          placeholder=""
          required
        />
        <div className="divider"></div>
        <div className="form-fields">
          <FormField
            label="First Name"
            id="firstName"
            type="text"
            placeholder=""
            required
          />
          <FormField
            label="Last Name"
            id="lastName"
            type="text"
            placeholder=""
            required
          />
        </div>
        <div className="form-fields">
          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder=""
            required
          />
          <FormField
            label="Phone"
            id="phone"
            type="tel"
            placeholder=""
            required
          />
        </div>
        <Button type="button" variant="primary" size="btn-md">Add Person</Button>
        <Button type="submit" variant="primary" size="btn-md">Create</Button>
        <Button type="button" variant="secondary" size="btn-md">Cancel</Button>
      </form>
    </div>
  );
}

export default SignUpForm;