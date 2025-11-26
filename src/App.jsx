import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ProjectsList from './pages/ProjectsList'
import ProjectForm from './pages/ProjectForm'

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<ProjectsList />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
        </Routes>
      </AdminLayout>
    </Router>
  )
}

export default App

