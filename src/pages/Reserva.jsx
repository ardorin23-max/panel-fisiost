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

  // 🧠 Cargar servicios y fisioterapeutas al iniciar
  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then((r) => r.json())
      .then(setServicios)
      .catch(console.error);

    fetch(`${API_URL}/api/users`)
      .then((r) => r.json())
      .then(setFisios)
      .catch(console.error);
  }, []);

  // 🕒 Generar horarios de 45 min (de 09:00 a 20:00)
  const generarHoras = () => {
    if (!fechaSel) return;
    const horas = [];
    let inicio = new Date(`${fechaSel}T09:00`);
    const fin = new Date(`${fechaSel}T20:00`);
    while (inicio < fin) {
      const hora = inicio.toTimeString().slice(0, 5);
      horas.push(hora);
      inicio = new Date(inicio.getTime() + 45 * 60000);
    }
    setHorasDisponibles(horas);
  };

  useEffect(generarHoras, [fechaSel]);

  // 🧭 Eliminar horas ocupadas para ese fisio y día
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!fisioSel || !fechaSel) return;
      try {
        const res = await fetch(
          `${API_URL}/api/bookings/check-day?fisio=${encodeURIComponent(
            fisioSel
          )}&date=${fechaSel}`
        );
        const data = await res.json();
        if (data.bookedHours) {
          setHorasDisponibles((prev) =>
            prev.filter((h) => !data.bookedHours.includes(h))
          );
        }
      } catch (err) {
        console.error("Error al cargar disponibilidad:", err);
      }
    };
    cargarDisponibilidad();
  }, [fisioSel, fechaSel]);

  // ✅ Crear reserva
  const crearReserva = async () => {
    if (!servicioSel || !fisioSel || !fechaSel || !horaSel) {
      setMensaje("⚠️ Completa todos los campos antes de reservar.");
      return;
    }

    try {
      // 1️⃣ Verificar si ya hay una reserva
      const checkUrl = `${API_URL}/api/bookings/check?fisio=${encodeURIComponent(
        fisioSel
      )}&date=${fechaSel}&time=${horaSel}`;
      const checkRes = await fetch(checkUrl);
      if (!checkRes.ok) throw new Error("Error al comprobar disponibilidad");

      const checkData = await checkRes.json();
      if (checkData.exists) {
        setMensaje(`⛔ ${fisioSel} ya tiene una reserva a esa hora.`);
        return;
      }

      // 2️⃣ Crear la reserva
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: servicioSel,
          fisio: fisioSel,
          date: fechaSel,
          time: horaSel,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Reserva creada con éxito y añadida al calendario.");
        setServicioSel("");
        setFisioSel("");
        setFechaSel("");
        setHoraSel("");
      } else {
        setMensaje("⚠️ Error al crear reserva: " + (data.message || "Intenta de nuevo"));
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo conectar con el servidor.");
    }
  };

  // 🧱 Renderizado
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-fisioGreen">Nueva Reserva</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Servicio */}
        <div>
          <label className="block mb-1">Servicio</label>
          <select
            className="input"
            value={servicioSel}
            onChange={(e) => setServicioSel(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.duration} min) — {s.price}€
              </option>
            ))}
          </select>
        </div>

        {/* Fisioterapeuta */}
        <div>
          <label className="block mb-1">Fisioter
