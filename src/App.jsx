import { Routes, Route } from "react-router"
// import Navbar from "./Components/Navbar"
import Header from "./Pages/Header"
import Home from "./Pages/Home"
import CreatePostPage from "./Pages/CreatePostPage"
// import { useThemeToggle } from "./context/ThemeToggle_Context.jsx"
function App() {


  return (
    <div>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
