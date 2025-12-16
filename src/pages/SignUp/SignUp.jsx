import '../../App.css'
import Header from '../../components/Header/Header'
import Subheader from '../../components/Subheader/Subheader'
import SignUpForm from '../../components/SignUpForm/SignUpForm'

function SignUp() {
  return (
    <>
      <Header text="Architectural Review for Marvel Associates"/>
      <Subheader text="Please complete the following fields to create your profile." />
      <SignUpForm />
    </>
  )
}

export default SignUp;