import '../../App.css'
import AppShell from '../../components/AppShell/AppShell'
import SignUpForm from '../../components/SignUpForm/SignUpForm'

function SignUp() {
  return (
    <AppShell subheaderText="Please complete the following fields to create your profile.">
      <SignUpForm />
    </AppShell>
  )
}

export default SignUp;
