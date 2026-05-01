import '../../App.css'
import AppShell from "../../components/AppShell/AppShell"
import ForgotPasswordForm from "../../components/ForgotPasswordForm/ForgotPasswordForm"

function ForgotPassword() {
  return (
    <AppShell subheaderText="Enter your email address and we will send you a temporary code.">
      <ForgotPasswordForm />
    </AppShell>
  )
}

export default ForgotPassword
