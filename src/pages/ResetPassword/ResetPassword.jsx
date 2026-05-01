import '../../App.css'
import AppShell from "../../components/AppShell/AppShell"
import ResetPasswordForm from "../../components/ResetPasswordForm/ResetPasswordForm"

function ResetPassword() {
  return (
    <AppShell subheaderText="Use your temporary code to set a new password.">
      <ResetPasswordForm />
    </AppShell>
  )
}

export default ResetPassword
