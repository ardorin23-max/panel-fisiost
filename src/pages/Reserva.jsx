import React, { useState, useEffect } from "react";

export default function Reserva() {
  const [servicios, setServicios] = useState([]);
  const [fisios, setFisios] = useState([]);
  const [servicioSel, setServicioSel] = useState("");
  const [fisioSel, setFisioSel] = useState("");
  const [fechaSel, setFechaSel] = useState("");
  const [horaSel, setHoraSel] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://fisiost-backend.vercel.app";

  // CARGA servicios y fisios — acepta dos formatos de respuesta:
  // 1) array directo: [ ... ]
  // 2) objeto: { ok: true, services: [...] } o { services: [...] }
  useEffect(() => {
    const load = async () => {
      try {
        const sRes = await fetch(`${API_URL}/api/services`);
        const sJson = await sRes.json();
        const sList = Array.isArray(sJson) ? sJson : (sJson.services || sJson);
        setServicios(sList || []);
      } catch (e) {
        console.error("Error cargando services:", e);
        setServicios([]);
      }

      try {
        const fRes = await fetch(`${API_URL}/api/users`);
        const fJson = await fRes.json();
        const fList = Array.isArray(fJson) ? fJson : (fJson.users || fJson);
        setFisios(fList || []);
      } catch (e) {
        console.error("Error cargando users:", e);
        setFisios([]);
      }
    };
    load();
  }, [API_URL]);

  // Generar horarios de 45 min (de 09:00 a 20:00)
  useEffect(() => {
    if (!fechaSel) {
      setHorasDisponibles([]);
      return;
    }
    const horas = [];
    let inicio = new Date(`${fechaSel}T09:00`);
    const fin = new Date(`${fechaSel}T20:00`);
    while (inicio < fin) {
      const hora = inicio.toTimeString().slice(0, 5);
      horas.push(hora);
      inicio = new Date(inicio.getTime() + 45 * 60000);
    }
    setHorasDisponibles(horas);
  }, [fechaSel]);

  // Quitar horas ya ocupadas por ese fisio el día (si existe endpoint check-day)
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!fisioSel || !fechaSel) return;
      try {
        const res = await fetch(
          `${API_URL}/api/bookings/check-day?fisio=${encodeURIComponent(fisioSel)}&date=${fechaSel}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const booked = data.bookedHours || data.booked || [];
        setHorasDisponibles((prev) => prev.filter((h) => !booked.includes(h)));
      } catch (err) {
        console.error("Error check-day:", err);
      }
    };
    cargarDisponibilidad();
  }, [fisioSel, fechaSel, API_URL]);

  // Crear reserva — usa /api/bookings y hace pre-check
  const crearReserva = async () => {
    setMensaje("");
    if (!servicioSel || !fisioSel || !fechaSel || !horaSel) {
      setMensaje("⚠️ Completa todos los campos antes de reservar.");
      return;
    }

    try {
      // PRE-CHECK: existe reserva para fisio en ese slot?
      const checkRes = await fetch(
        `${API_URL}/api/bookings/check?fisio=${encodeURIComponent(fisioSel)}&date=${fechaSel}&time=${horaSel}`
      );
      if (!checkRes.ok) throw new Error("Error al comprobar disponibilidad");
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setMensaje(`⛔ ${fisioSel} ya tiene una reserva a esa hora.`);
        return;
      }

      // CREAR
      const createRes = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: servicioSel, // nombre del servicio
          fisio: fisioSel,      // nombre del fisio
          date: fechaSel,
          time: horaSel
        })
      });

      const createData = await createRes.json();
      if (createRes.ok && createData.ok !== false) {
        setMensaje("✅ Reserva creada y añadida al calendario.");
        // refrescar disponibilidad localmente
        setServicioSel("");
        setFisioSel("");
        setFechaSel("");
        setHoraSel("");
        // opcional: quitar la hora de la lista
        setHorasDisponibles((prev) => prev.filter((h) => h !== horaSel));
      } else {
        console.error("Crear reserva fallo:", createData);
        setMensaje("❌ Error creando reserva: " + (createData.message || createData.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error de conexión con el servidor.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-fisioGreen">Nueva Reserva</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Servicio */}
        <div>
          <label className="block mb-1">Servicio</label>
          <select className="input" value={servicioSel} onChange={(e) => setServicioSel(e.target.value)}>
            <option value="">Seleccionar servicio...</option>
            {servicios.map((s) => (
              <option key={s.id ?? s.name} value={s.name}>
                {s.name} ({s.duration ?? s.duration} min) — {s.price ?? ""}€
              </option>
            ))}
          </select>
        </div>

        {/* Fisioterapeuta */}
        <div>
          <label className="block mb-1">Fisioterapeuta</label>
          <select className="input" value={fisioSel} onChange={(e) => setFisioSel(e.target.value)}>
            <option value="">Seleccionar fisioterapeuta...</option>
            {fisios.map((f) => (
              <option key={f.id ?? f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block mb-1">Fecha</label>
          <input type="date" className="input" value={fechaSel} onChange={(e) => setFechaSel(e.target.value)} />
        </div>

        {/* Hora */}
        <div>
          <label className="block mb-1">Hora</label>
          <select className="input" value={horaSel} onChange={(e) => setHoraSel(e.target.value)}>
            <option value="">Seleccionar hora...</option>
            {horasDisponibles.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn bg-fisioGreen text-white w-full" onClick={crearReserva}>
        Reservar
      </button>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </div>
  );
}
