import React, {useState, useEffect} from 'react'

export default function Usuarios(){
  const [users, setUsers] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('fisios_v1')) || [] }catch(e){ return [] }
  })
  const [name, setName] = useState('')
  const [color, setColor] = useState('#10b981')

  useEffect(()=> localStorage.setItem('fisios_v1', JSON.stringify(users)), [users])

  const add = ()=>{
    if(!name) return alert('Nombre requerido')
    setUsers([...users, { id: Date.now().toString(), name, color }])
    setName('')
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Usuarios / Fisioterapeutas</h3>
      <div className="mb-3">
        <input className="p-2 border rounded mr-2" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="mr-2"/>
        <button className="bg-fisioGreen text-white px-3 py-1 rounded" onClick={add}>Añadir</button>
      </div>
      {users.length===0 && <div className="text-sm text-gray-500">No hay fisioterapeutas</div>}
      {users.map(u=>(
        <div key={u.id} className="flex items-center justify-between border p-2 rounded mb-2">
          <div className="flex items-center gap-3">
            <div style={{width:18,height:18,background:u.color,borderRadius:4}}></div>
            <div>{u.name}</div>
          </div>
          <div>
            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>setUsers(users.filter(x=>x.id!==u.id))}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
