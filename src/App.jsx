import { Routes, Route } from "react-router"
// import Navbar from "./Components/Navbar"
import Header from "./Pages/Header"
import Home from "./Pages/Home"
import CreatePostPage from "./Pages/CreatePostPage"
// import { useThemeToggle } from "./context/ThemeToggle_Context.jsx"
function App() {


  return (
    <>
      <Header />
      <main className="pt-16 md:pt-20 pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
