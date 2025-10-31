import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = "https://tu-backend.vercel.app"; // 🔁 Sustituye por tu backend real
const API_KEY = "fisio123";

export default function ReservasLista() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accion, setAccion] = useState("");

  useEffect(() => {
    cargarReservas();
  }, []);

  // ===============================
  // 🔹 CARGAR TODAS LAS RESERVAS
  // ===============================
  const cargarReservas = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/bookings/list`, {
        headers: { "x-api-key": API_KEY },
      });

      // Google Calendar devuelve events → convertimos a formato usable
      const eventos = (res.data.events || []).map((ev) => ({
        id: ev.id,
        service: ev.summary || "Sin título",
        fisio: ev.description || "—",
        start: ev.start?.dateTime,
        end: ev.end?.dateTime,
        color: ev.colorId ? colorGoogle(ev.colorId) : "#38bdf8",
      }));

      // Ordenar por fecha
      const ordenadas = eventos.sort(
        (a, b) => new Date(a.start) - new Date(b.start)
      );

      setReservas(ordenadas);
    } catch (err) {
      console.error("❌ Error al cargar reservas:", err);
      setError("Error al cargar reservas.");
    }
    setCargando(false);
  };

  // ===============================
  // 🔹 CANCELAR RESERVA
  // ===============================
  const cancelarReserva = async (eventId) => {
    if (!window.confirm("¿Seguro que quieres cancelar esta reserva?")) return;
    try {
      setAccion(`Cancelando ${eventId}...`);
      await axios.delete(`${API_URL}/api/bookings/cancel/${eventId}`, {
        headers: { "x-api-key": API_KEY },
      });
      setAccion("");
      cargarReservas(); // recargar lista
    } catch (err) {
      console.error("❌ Error cancelando reserva:", err);
      setAccion("Error al cancelar la reserva");
    }
  };

  // ===============================
  // 🎨 COLORES DE GOOGLE CALENDAR
  // ===============================
  const colorGoogle = (id) => {
    const mapa = {
      1: "#a4bdfc",
      2: "#7ae7bf",
      3: "#dbadff",
      4: "#ff887c",
      5: "#fbd75b",
      6: "#ffb878",
      7: "#46d6db",
      8: "#e1e1e1",
      9: "#5484ed",
      10: "#51b749",
      11: "#dc2127",
    };
    return mapa[id] || "#38bdf8";
  };

  // ===============================
  // 🔹 INTERFAZ
  // ===============================
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
        📅 Reservas Actuales
      </h2>

      {cargando && <p className="text-center">Cargando reservas...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {accion && <p className="text-center text-blue-500">{accion}</p>}

      {!cargando && reservas.length === 0 && (
        <p className="text-center text-gray-500">No hay reservas actualmente.</p>
      )}

      {!cargando && reservas.length > 0 && (
        <div className="space-y-3">
          {reservas.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              style={{
                borderLeft: `6px solid ${r.color}`,
              }}
            >
              <div>
                <p className="font-semibold text-lg">{r.service}</p>
                <p className="text-sm text-gray-600">
                  {r.fisio} — {dayjs(r.start).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
              <button
                onClick={() => cancelarReserva(r.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
              >
                Cancelar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={cargarReservas}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          🔄 Actualizar lista
        </button>
      </div>
    </div>
  );
}
