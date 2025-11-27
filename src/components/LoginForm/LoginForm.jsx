import './LoginForm.css'
import { useState } from "react"
import Button from "../Button/Button"
import FormField from "../FormField/FormField"
import Paragraph from "../Paragraph/Paragraph"

function LoginForm() {
  return (
    <>
      <div className="login-container">
        <form className="login-form">
          <div className="form-fields">
            <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="tonystark@marvel.com"
            required
            />
            <FormField
              label="Password"
              id="password"
              type="password"
              placeholder="***"
              required
            />
          </div>
          <div className="form-actions">
            <Button type="submit" variant="primary" size="btn-md">Log In</Button>
            <Button type="button" variant="text"size="btn-sm">Forgot your password?</Button>
          </div>
          <div className="signup-section">
            <Paragraph text="Don't have an account?"></Paragraph>
            <Button type="button" variant="secondary" size="btn-md">Sign Up</Button>
          </div>
        </form>
      </div>
      
      </>
  );
}

export default LoginForm;