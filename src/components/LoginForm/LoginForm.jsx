import { useState } from "react"
import Button from "../Button/Button"

function LoginForm() {
  return (
    <>
      <form>
        <label>
          Email
          <input
            type="email"
            // value={email}
            placeholder="tonystark@marvel.com" />
        </label>

        <label>
            Password
            <input
              type="password"
              // value={password}
              placeholder="***" />
          </label>
          <Button type="submit" className="primary">Log In</Button>
          <Button type="submit" className="text">Forgot your password?</Button>
          <Button type="submit" className="secondary">Sign Up</Button>
      </form>
      </>
  );
}

export default LoginForm;