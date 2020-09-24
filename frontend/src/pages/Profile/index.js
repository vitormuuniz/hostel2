import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPower, FiTrash2 } from "react-icons/fi";

import "./styles.css";

import logoImg from "../../assets/images/logo.png";
import api from "../../services/api";

export default function Reserva() {
  const [reservas, setReservas] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("api/reservations", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        setReservas(response.data);
      });
  }, [token]);

  async function handleDeleteReservation(id) {
    try {
      alert("Deletou");
      api.delete(`api/reservations/${id}`, {
        headers: {
          Authorization: "Bearer " + token,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        },
      });
    } catch (err) {
      alert("Erro ao deletar caso, tente novamente.");
    }
  }

  return (
    <div className="profile-container">
      <header>
        <img src={logoImg} alt="Logo" />
        <span>Bem-vindo ao Hostel</span>

        <Link className="button" to="/reservation/newReservation">
          Cadastrar nova reserva
        </Link>
        <button type="button">
          <FiPower size={18} color="#E02041" />
        </button>
      </header>

      {reservas.length === 0 ? (
        <h1>Você não tem nenhuma reserva cadastrada!</h1>
      ) : (
        <div>
          <h1>Suas reservas cadastradas</h1>

          <ul>
            {reservas.map(
              ({ id, rooms, checkinDate, checkoutDate, payments }, i) => (
                <li key={id}>
                  <strong>QUARTOS RESERVADOS:</strong>
                  {rooms.map((rooms, j) => (
                    <p key={j}>{rooms.number}</p>
                  ))}

                  <strong>CHECKIN:</strong>
                  <p>{checkinDate}</p>

                  <strong>CHECKOUT:</strong>
                  <p>{checkoutDate}</p>

                  <strong>VALOR:</strong>
                  <p>R$ {payments.amount},00</p>

                  <button
                    onClick={() => handleDeleteReservation(id)}
                    type="button"
                  >
                    <FiTrash2 size={20} color="#a8a8b3" />
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}