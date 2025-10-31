import React, { useState, useEffect } from "react";

export default function Reserva() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar lista de usuarios (pacientes)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  // Enviar la reserva al backend
  const crearReserva = async () => {
    if (!usuario || !fecha || !hora) {
      setMensaje("⚠️ Completa todos los campos.");
      return;
    }

    setMensaje("⏳ Creando reserva...");

    const inicio = `${fecha}T${hora}:00`;
    const fin = new Date(new Date(inicio).getTime() + 45 * 60000)
      .toISOString()
      .slice(11, 16); // +45 minutos

    const response = await fetch(`${import.meta.env.VITE_API_URL}/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario,
        fecha,
        horaInicio: hora,
        horaFin: fin,
      }),
    });

    if (response.ok) {
      setMensaje("✅ Reserva creada correctamente");
      setUsuario("");
      setFecha("");
      setHora("");
    } else {
      setMensaje("❌ Error al crear la reserva");
    }
  };

  // Generar horas disponibles (ej: 09:00 - 21:00, cada 45 min)
  const generarHoras = () => {
    const horas = [];
    const inicio = 9 * 60; // 9:00
    const fin = 21 * 60; // 21:00
    for (let m = inicio; m < fin; m += 45) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const min = String(m % 60).padStart(2, "0");
      horas.push(`${h}:${min}`);
    }
    return horas;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-fisioGreen">Nueva Reserva</h2>

      <div className="flex flex-col gap-4 max-w-sm">
        <select
          className="border p-2 rounded"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        >
          <option value="">Seleccionar paciente</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
        >
          <option value="">Seleccionar hora</option>
          {generarHoras().map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <button
          onClick={crearReserva}
          className="bg-fisioGreen text-white p-2 rounded"
        >
          Crear Reserva
        </button>

        {mensaje && <p className="mt-2 text-sm">{mensaje}</p>}
      </div>
    </div>
  );
}
