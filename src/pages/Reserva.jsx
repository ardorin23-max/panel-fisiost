import React, { useState, useEffect } from 'react'

export default function Reserva() {
  const [servicios, setServicios] = useState([])
  const [fisios, setFisios] = useState([])
  const [servicioSel, setServicioSel] = useState('')
  const [fisioSel, setFisioSel] = useState('')
  const [fechaSel, setFechaSel] = useState('')
  const [horaSel, setHoraSel] = useState('')
  const [horasDisponibles, setHorasDisponibles] = useState([])
  const [mensaje, setMensaje] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'https://fisiost-backend.vercel.app'

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(r => r.json())
      .then(setServicios)
      .catch(console.error)

    fetch(`${API_URL}/api/users`)
      .then(r => r.json())
      .then(setFisios)
      .catch(console.error)
  }, [])

  // Generar horarios de 45 min (de 09:00 a 20:00)
  const generarHoras = () => {
    if (!fechaSel) return
    const horas = []
    let inicio = new Date(`${fechaSel}T09:00`)
    const fin = new Date(`${fechaSel}T20:00`)
    while (inicio < fin) {
      const hora = inicio.toTimeString().slice(0, 5)
      horas.push(hora)
      inicio = new Date(inicio.getTime() + 45 * 60000)
    }
    setHorasDisponibles(horas)
  }

  useEffect(generarHoras, [fechaSel])

  const crearReserva = async () => {
    if (!servicioSel || !fisioSel || !fechaSel || !horaSel) {
      setMensaje('⚠️ Completa todos los campos antes de reservar.')
      return
    }

    try {
      // 1️⃣ Verificar si ya hay una reserva en ese horario
      const checkRes = await fetch(`${API_URL}/api/bookings/check?fisio=${fisioSel}&date=${fechaSel}&time=${horaSel}`)
      const checkData = await checkRes.json()

      if (checkData.exists) {
        setMensaje('⛔ Ese fisioterapeuta ya tiene una reserva en esa hora.')
        return
      }

      // 2️⃣ Si no hay conflicto, crear la reserva
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: servicioSel,
          fisio: fisioSel,
          date: fechaSel,
          time: horaSel
        })
      })

      if (res.ok) {
        setMensaje('✅ Reserva creada con éxito y añadida al calendario.')
        setServicioSel('')
        setFisioSel('')
        setFechaSel('')
        setHoraSel('')
      } else {
        const data = await res.json()
        setMensaje('⚠️ Error al crear reserva: ' + (data.message || 'Intenta de nuevo'))
      }
    } catch (err) {
      console.error(err)
      setMensaje('❌ No se pudo conectar con el servidor.')
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-fisioGreen">Nueva Reserva</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Servicio</label>
          <select
            className="input"
            value={servicioSel}
            onChange={e => setServicioSel(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {servicios.map(s => (
              <option key={s.id} value={s.name}>{s.name} ({s.duration} min)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Fisioterapeuta</label>
          <select
            className="input"
            value={fisioSel}
            onChange={e => setFisioSel(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {fisios.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Fecha</label>
          <input
            type="date"
            className="input"
            value={fechaSel}
            onChange={e => setFechaSel(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Hora</label>
          <select
            className="input"
            value={horaSel}
            onChange={e => setHoraSel(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {horasDisponibles.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn bg-fisioGreen text-white w-full" onClick={crearReserva}>
        Reservar
      </button>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </div>
  )
}
