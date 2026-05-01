import '../../App.css'
import AppShell from "../../components/AppShell/AppShell";
import LoginForm from "../../components/LoginForm/LoginForm";

function Login() {
  return (
    <AppShell subheaderText="For submitting, notifying, reviewing, and seeking approval on exterior home improvements.">
      <LoginForm />
    </AppShell>
  );
}

export default Login;
