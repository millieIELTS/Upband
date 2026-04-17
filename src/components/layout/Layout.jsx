import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
