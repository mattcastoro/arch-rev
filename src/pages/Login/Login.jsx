import '../../App.css'
import './Login.css'
import { useState } from 'react'
import AppShell from "../../components/AppShell/AppShell";
import Button from '../../components/Button/Button'
import LoginForm from "../../components/LoginForm/LoginForm";

function Login() {
  const [showDevelopmentNotice, setShowDevelopmentNotice] = useState(true)

  return (
    <>
      <AppShell subheaderText="For submitting, notifying, reviewing, and seeking approval on exterior home improvements.">
        <LoginForm />
      </AppShell>
      {showDevelopmentNotice && (
        <div className="development-notice__backdrop">
          <section
            className="development-notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="development-notice-title"
            aria-describedby="development-notice-description"
          >
            <h2 id="development-notice-title">This application is still in development</h2>
            <div id="development-notice-description" className="development-notice__content">
              <p>
                You’re welcome to create an account and test the application while work continues.
              </p>
              <p>
                Your account and application information will be stored only in this browser’s local storage on this device. It will not be available on other devices and may be lost if you clear your browser data.
              </p>
            </div>
            <Button autoFocus onClick={() => setShowDevelopmentNotice(false)}>
              I understand
            </Button>
          </section>
        </div>
      )}
    </>
  );
}

export default Login;
