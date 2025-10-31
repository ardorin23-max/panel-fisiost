import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = "https://fisio-backend.vercel.app"; // 🔁 Sustituye por tu URL backend real
const API_KEY = "fisio123";

export default function ReservasLista() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReservas();
  }, []);

  // ===============================
  // 🔹 CARGAR TODAS LAS RESERVAS
  // ===============================
  const cargarReservas = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_URL}/api/bookings`, {
        headers: { "x-api-key": API_KEY },
      });

      // Ordenar por fecha y hora
      const ordenadas = res.data.sort((a, b) => {
        const fechaA = new Date(`${a.date}T${a.time}`);
        const fechaB = new Date(`${b.date}T${b.time}`);
        return fechaA - fechaB;
      });

      setReservas(ordenadas);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      setError("❌ No se pudieron cargar las reservas.");
    }
    setCargando(false);
  };

  // ===============================
  // 🔹 INTERFAZ
  // ===============================
  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-fisioGreen">
        📅 Reservas Actuales
      </h2>

      {cargando && <p className="text-center">Cargando reservas...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!cargando && reservas.length === 0 && (
        <p className="text-center text-gray-500">No hay reservas todavía.</p>
      )}

      {!cargando && reservas.length > 0 && (
        <div className="space-y-3">
          {reservas.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-xl p-3 shadow-sm hover:shadow-md transition"
              style={{
                borderLeft: `6px solid ${r.color || "#38bdf8"}`, // color del fisio o del evento
              }}
            >
              <div>
                <p className="font-semibold text-lg">{r.service}</p>
                <p className="text-sm text-gray-600">
                  {r.fisio} — {dayjs(r.date).format("DD/MM/YYYY")} a las {r.time}
                </p>
              </div>
              <span className="text-gray-500 text-sm">{r.duration || "45"} min</span>
            </div>
          ))}
        </div>
      )}

      {/* Botón de recarga */}
      <div className="text-center mt-6">
        <button
          onClick={cargarReservas}
          className="px-4 py-2 bg-fisioGreen text-white rounded-lg hover:bg-green-700 transition"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
}
