import LoginForm from "../components/LoginForm/LoginForm";
import Header from "../components/Header/Header"
import Subheader from "../components/Subheader/Subheader";

function Login() {
  return (
    <>
      <Header text="Architectural Review for Marvel Associates"/>
      <Subheader text="For submitting, notifying, reviewing, and seeking approval on exterior home improvements." />
      <LoginForm/>
    </>
  );
}

export default Login;