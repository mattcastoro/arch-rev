import { useState } from "react"
import Button from "../Button/Button"
import FormField from "../FormField/FormField";

function LoginForm() {
  return (
    <>
      <form>

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
        <div>
          <Button type="submit" variant="primary" size="btn-md">Log In</Button>
          <Button type="button" variant="text"size="btn-sm">Forgot your password?</Button>
        </div>
        
        <Button type="button" variant="secondary" size="btn-md">Sign Up</Button>

      </form>
      </>
  );
}

export default LoginForm;