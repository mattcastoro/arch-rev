import Header from "../Header/Header"
import Subheader from "../Subheader/Subheader"

const DEFAULT_HEADER_TEXT = "Architectural Review for Marvel HOA"

function AppShell({
  children,
  subheaderText,
  headerText = DEFAULT_HEADER_TEXT,
}) {
  return (
    <>
      <Header text={headerText} />
      {subheaderText && <Subheader text={subheaderText} />}
      {children}
    </>
  )
}

export default AppShell
