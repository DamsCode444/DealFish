import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Navbar from './components/Navbar'
import  HomePage  from './pages/HomePage'
import  ProductPage  from './pages/ProductPage'
import  ProfilePage  from './pages/ProfilePage'
import  CreatePage  from './pages/CreatePage'
import  EditProductPage  from './pages/EditProductPage'
import  {Routes, Route, Navigate } from 'react-router'
import useAuthReq from './hooks/useAuthReq'
import useUserSync from './hooks/useUserSync'
import LoadingSpinner from "./components/LoadingSpinner";


function App() {
  const { isSignedIn, isClerkLoaded } = useAuthReq();
  useUserSync();
  if (!isClerkLoaded) {
    return <LoadingSpinner />; // or null
  }

  return (
  <div className='min-h-screen bg-base-100'>
    <Navbar />
    <main className='max-w-5xl mx-auto px-4 py-8'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={isSignedIn ? <ProductPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={isSignedIn ? <CreatePage /> :<>
              <p>You must be signed in to create a product</p>
              <Navigate to="/" />
          </> } />
          <Route path="/edit/:id" element={<EditProductPage />} />
        </Routes>
    </main>
  </div>
  )
}

export default App
