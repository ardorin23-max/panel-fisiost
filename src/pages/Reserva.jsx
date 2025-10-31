import React, { useEffect, useState } from "react";

export default function Reserva() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://TU_BACKEND.onrender.com";

  const fetchSlots = async () => {
    if (!date) return;
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/schedule/free?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando huecos disponibles");
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async () => {
    if (!selected) return alert("Selecciona un horario");
    try {
      const res = await fetch(`${API_URL}/api/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selected.start,
          end: selected.end,
          name: "Paciente prueba",
          email: "paciente@correo.com",
          service: "Sesión Fisioterapia 45min",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess("✅ Reserva creada correctamente");
        setSlots([]);
        setSelected(null);
      } else {
        alert("Error al crear reserva: " + data.error);
      }
    } catch (err) {
      alert("Error en la reserva");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Reservar sesión</h1>

      <div className="flex items-center gap-3 mb-4 justify-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg p-2"
        />
        <button
          onClick={fetchSlots}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
        >
          Ver disponibles
        </button>
      </div>

      {loading && <p className="text-center">Cargando...</p>}

      {!loading && slots.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelected(s)}
              className={`p-3 rounded-xl border ${
                selected?.start === s.start
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {slots.length === 0 && !loading && date && (
        <p className="text-center mt-3 text-gray-500">No hay huecos libres</p>
      )}

      {selected && (
        <div className="text-center mt-4">
          <p className="mb-2 font-medium">
            Seleccionado: {selected.label}
          </p>
          <button
            onClick={bookSlot}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Confirmar reserva
          </button>
        </div>
      )}

      {success && (
        <p className="text-center text-green-600 mt-4 font-semibold">
          {success}
        </p>
      )}
    </div>
  );
}
