import { Routes, Route } from "react-router"
// import Navbar from "./Components/Navbar"
import Header from "./Pages/Header"
import Home from "./Pages/Home"
import CreatePostPage from "./Pages/CreatePostPage"
import PostPage from "./Pages/PostPage"
// import { useThemeToggle } from "./context/ThemeToggle_Context.jsx"
function App() {


  return (
    <>
      <Header />
      <main className="pt-16 md:pt-20 pb-24 dark:text-white dark:bg-[#09090B]  bg-slate-500/10 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
