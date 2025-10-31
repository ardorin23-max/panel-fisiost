import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://fisio-backend.vercel.app"; // 🔁 Sustituye por tu URL backend real
const API_KEY = "fisio123";

export default function Reserva() {
  const [servicios, setServicios] = useState([]);
  const [fisios, setFisios] = useState([]);
  const [form, setForm] = useState({
    service: "",
    fisio: "",
    date: "",
    time: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // 🔹 CARGAR DATOS INICIALES
  // ===============================
  useEffect(() => {
    cargarServicios();
    cargarFisios();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services`, {
        headers: { "x-api-key": API_KEY },
      });
      setServicios(res.data);
    } catch (err) {
      console.error("Error cargando servicios:", err);
    }
  };

  const cargarFisios = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { "x-api-key": API_KEY },
      });
      setFisios(res.data);
    } catch (err) {
      console.error("Error cargando fisios:", err);
    }
  };

  // ===============================
  // 🔹 CAMBIAR DATOS DEL FORMULARIO
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // 🔹 ENVIAR RESERVA
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/bookings`,
        form,
        { headers: { "x-api-key": API_KEY } }
      );

      if (res.data.ok) {
        setMensaje("✅ Reserva creada correctamente en Google Calendar");
        setForm({ service: "", fisio: "", date: "", time: "" });
      } else {
        setMensaje(`⚠️ ${res.data.message || "Error al crear la reserva"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setMensaje("❌ Error al conectar con el servidor");
    }

    setLoading(false);
  };

  // ===============================
  // 🔹 INTERFAZ
  // ===============================
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-6">Nueva Reserva</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Servicio */}
        <div>
          <label className="block mb-1 font-medium">Servicio</label>
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">-- Selecciona un servicio --</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.duration} min - {s.price}€)
              </option>
            ))}
          </select>
        </div>

        {/* Fisioterapeuta */}
        <div>
          <label className="block mb-1 font-medium">Fisioterapeuta</label>
          <select
            name="fisio"
            value={form.fisio}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">-- Selecciona un fisioterapeuta --</option>
            {fisios.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block mb-1 font-medium">Fecha</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {/* Hora */}
        <div>
          <label className="block mb-1 font-medium">Hora</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Guardando..." : "Crear Reserva"}
        </button>
      </form>

      {mensaje && (
        <p className="text-center mt-4 text-sm text-gray-700">{mensaje}</p>
      )}
    </div>
  );
}
