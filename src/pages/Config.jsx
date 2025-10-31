import React, {useState, useEffect} from 'react'

export default function Config(){
  const [backend, setBackend] = useState(localStorage.getItem('backend_url') || 'https://backend-fisiost-v2.onrender.com')
  const [apiKey, setApiKey] = useState(localStorage.getItem('api_key') || 'fisio123')

  useEffect(()=>{
    localStorage.setItem('backend_url', backend)
    localStorage.setItem('api_key', apiKey)
  },[backend, apiKey])

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Configuración</h3>
      <label className="block text-sm text-gray-600">Backend URL</label>
      <input className="w-full p-2 border rounded mb-3" value={backend} onChange={e=>setBackend(e.target.value)} />
      <label className="block text-sm text-gray-600">API Key</label>
      <input className="w-full p-2 border rounded" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
      <p className="text-sm text-gray-500 mt-2">Los valores se guardan en localStorage</p>
    </div>
  )
}
