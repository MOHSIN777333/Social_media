import { Routes, Route } from "react-router"
import Header from "./Pages/Header"
import Home from "./Pages/Home"
import CreatePostPage from "./Pages/CreatePostPage"
import PostPage from "./Pages/PostPage"
import CommunitiesPage from "./Pages/CommunitiesPage"
import ProfilePage from "./Pages/ProfilePage"
import AuthModal from "./Components/AuthModal"

function App() {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-20 pb-32 md:pb-16 dark:text-white dark:bg-[#09090B] bg-slate-500/10 text-zinc-900 dark:text-white min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <AuthModal />
    </>
  )
}

export default App
