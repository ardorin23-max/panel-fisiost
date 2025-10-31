import React, {useState} from 'react'

export default function Login({onAuth}){
  const [pwd, setPwd] = useState('')

  const submit = (e)=>{
    e.preventDefault()
    if(pwd === 'admin2025'){
      onAuth()
    } else {
      alert('Clave incorrecta')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="card w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Panel FisioST — Login</h2>
        <input className="w-full p-2 border rounded mb-3" placeholder="Clave admin" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="w-full bg-fisioGreen text-white p-2 rounded">Entrar</button>
        <p className="text-xs text-gray-500 mt-3">Clave: <strong>admin2025</strong></p>
      </form>
    </div>
  )
}
