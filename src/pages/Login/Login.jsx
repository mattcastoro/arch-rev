import './Login.css'
import LoginForm from "../../components/LoginForm/LoginForm";
import Header from "../../components/Header/Header"
import Subheader from "../../components/Subheader/Subheader";

function Login() {
  return (
    <div className="login-page-container">
      <Header text="Architectural Review for Marvel Associates"/>
      <Subheader text="For submitting, notifying, reviewing, and seeking approval on exterior home improvements." />
      <LoginForm/>
    </div>
  );
}

export default Login;