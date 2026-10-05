import Navbar from './Navbar'

export default function PublicLayout({ children }) {
  return (
    <div className="public-site">
      <Navbar />
      {children}
    </div>
  )
}
