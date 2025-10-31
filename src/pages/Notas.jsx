import React, {useState, useEffect} from 'react'

export default function Notas(){
  const [text, setText] = useState(localStorage.getItem('panel_notes') || '')

  useEffect(()=> localStorage.setItem('panel_notes', text), [text])

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Notas internas</h3>
      <textarea className="w-full p-2 border rounded h-40" value={text} onChange={e=>setText(e.target.value)} />
      <p className="text-sm text-gray-500 mt-2">Guardado en localStorage</p>
    </div>
  )
}
