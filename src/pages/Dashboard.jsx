import React, {useState, useEffect} from 'react'
import axios from 'axios'

function fmt(d){ try { return new Date(d).toLocaleString() }catch(e){ return d } }

export default function Dashboard(){
  const backend = localStorage.getItem('backend_url') || 'https://backend-fisiost-v2.onrender.com'
  const apiKey = localStorage.getItem('api_key') || 'fisio123'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ serviceName:'Fisioterapia', fisioId:'', start:'', end:'', clientName:'', phone:'' })

  const load = async () => {
    setLoading(true)
    try{
      const from = new Date(); from.setDate(from.getDate()-1)
      const to = new Date(); to.setDate(to.getDate()+30)
      const res = await axios.get(`${backend}/api/bookings/list?timeMin=${from.toISOString()}&timeMax=${to.toISOString()}`, { headers: { 'x-api-key': apiKey }})
      setEvents(res.data.events || [])
    }catch(e){
      alert('Error cargando reservas: '+(e.response?.data?.error || e.message))
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])

  const cancel = async (id)=>{
    if(!confirm('Confirmar cancelación')) return
    try{
      await axios.delete(`${backend}/api/bookings/cancel/${id}`, { headers: { 'x-api-key': apiKey }})
      alert('Reserva cancelada')
      load()
    }catch(e){ alert('Error al cancelar: '+(e.response?.data?.error || e.message)) }
  }

  const create = async ()=>{
    if(!form.clientName || !form.phone || !form.start || !form.end) return alert('Rellena todos los campos')
    try{
      // build body for create endpoint
      const body = {
        service: { name: form.serviceName },
        fisio: { id: form.fisioId || 'a', name: form.fisioId || 'a', colorId: '5' },
        booking: { start: new Date(form.start).toISOString(), end: new Date(form.end).toISOString(), clientName: form.clientName, phone: form.phone }
      }
      const res = await axios.post(`${backend}/api/bookings/create`, body, { headers: { 'x-api-key': apiKey }})
      alert('Reserva creada: '+(res.data.eventId || 'ok'))
      setForm({ serviceName:'Fisioterapia', fisioId:'', start:'', end:'', clientName:'', phone:'' })
      load()
    }catch(e){ alert('Error creando reserva: '+(e.response?.data?.error || e.message)) }
  }

  const users = JSON.parse(localStorage.getItem('fisios_v1') || '[]')

  return (
    <div>
      <div className="card flex justify-between items-center mb-4">
        <h3 className="font-semibold">Reservas</h3>
        <div>
          <button className="mr-2 px-3 py-1 bg-gray-200 rounded" onClick={load}>{loading ? 'Cargando...' : 'Recargar'}</button>
        </div>
      </div>

      <div className="card mb-4">
        <h4 className="font-semibold mb-2">Crear reserva manual</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="p-2 border rounded" placeholder="Servicio" value={form.serviceName} onChange={e=>setForm({...form, serviceName: e.target.value})} />
          <select className="p-2 border rounded" value={form.fisioId} onChange={e=>setForm({...form, fisioId: e.target.value})}>
            <option value="">-- Elige fisio --</option>
            {users.map(u=>(<option key={u.id} value={u.name}>{u.name}</option>))}
          </select>
          <input className="p-2 border rounded" placeholder="Fecha inicio (YYYY-MM-DD HH:MM)" value={form.start} onChange={e=>setForm({...form, start: e.target.value})} />
          <input className="p-2 border rounded" placeholder="Fecha fin (YYYY-MM-DD HH:MM)" value={form.end} onChange={e=>setForm({...form, end: e.target.value})} />
          <input className="p-2 border rounded" placeholder="Nombre cliente" value={form.clientName} onChange={e=>setForm({...form, clientName: e.target.value})} />
          <input className="p-2 border rounded" placeholder="Teléfono" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
        </div>
        <p className="text-sm text-gray-500 mt-2">Para fecha/hora escribe en formato ISO o "YYYY-MM-DD HH:MM" y el sistema lo intentará convertir.</p>
        <div className="mt-3"><button className="bg-fisioGreen text-white px-3 py-1 rounded" onClick={create}>Crear reserva</button></div>
      </div>

      {events.length===0 && <div className="text-sm text-gray-500">No hay reservas en este rango</div>}
      {events.map(ev=>(
        <div key={ev.id} className="card flex justify-between items-start mb-2">
          <div>
            <div className="font-semibold">{ev.summary || ev.extendedProperties?.private?.serviceId || 'Sin título'}</div>
            <div className="text-sm text-gray-600">{fmt(ev.start?.dateTime || ev.start?.date)}</div>
            <div className="text-sm text-gray-600">Tel: {ev.extendedProperties?.private?.phone || ''}</div>
          </div>
          <div>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>cancel(ev.id)}>Cancelar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
