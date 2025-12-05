import '../../App.css'
import Header from '../../components/Header/Header'
import Subheader from '../../components/Subheader/Subheader'
import SignUpForm from '../../components/SignUpForm/SignUpForm'

function SignUp() {
  return (
    <>
      <Header text="Architectural Review for Marvel Associates"/>
      <Subheader text="For submitting, notifying, reviewing, and seeking approval on exterior home improvements." />
      <SignUpForm />
    </>
  )
}

export default SignUp;