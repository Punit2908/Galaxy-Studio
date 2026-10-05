import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function PublicLayout() {
  return (
    <div className="public-site">
      <Navbar />
      <Outlet />
    </div>
  )
}
