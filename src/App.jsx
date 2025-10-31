import React, {useState} from 'react'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Notas from './pages/Notas'
import Config from './pages/Config'
import Login from './pages/Login'

export default function App(){
  const [auth, setAuth] = useState(localStorage.getItem('panel_auth') === 'true')
  const [section, setSection] = useState('dashboard')

  if(!auth) return <Login onAuth={() => { setAuth(true); localStorage.setItem('panel_auth','true') }} />

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="header">
        <h1 className="text-2xl font-bold text-fisioGreen">Panel FisioST</h1>
        <div>
          <button className="btn bg-gray-200 mr-2" onClick={()=>{ localStorage.removeItem('panel_auth'); window.location.reload(); }}>Logout</button>
        </div>
      </header>

      <nav className="mb-4 flex gap-2">
        <button className="btn bg-white border" onClick={()=>setSection('dashboard')}>Reservas</button>
        <button className="btn bg-white border" onClick={()=>setSection('usuarios')}>Usuarios</button>
        <button className="btn bg-white border" onClick={()=>setSection('notas')}>Notas</button>
        <button className="btn bg-white border ml-auto" onClick={()=>setSection('config')}>Config</button>
      </nav>

      <main>
        {section === 'dashboard' && <Dashboard />}
        {section === 'usuarios' && <Usuarios />}
        {section === 'notas' && <Notas />}
        {section === 'config' && <Config />}
      </main>
    </div>
  )
}
