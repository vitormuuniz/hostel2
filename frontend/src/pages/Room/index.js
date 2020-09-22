import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiPower, FiTrash2 } from "react-icons/fi";

import "./styles.css";

import logoImg from "../../assets/images/logo.png";
import api from "../../services/api";

export default function Profile() {
  const [rooms, setRoom] = useState([]);
  const token = localStorage.getItem("token");

  const history = useHistory();

  useEffect(() => {
    if(token != null) {
      api
        .get("api/rooms", {
          headers: { Authorization: "Bearer " + token },
        })
        .then((response) => {
          setRoom(response.data);
        });
    } 
  }, [token]);

  async function handleDeleteRoom(id) {
    try {
      alert("Deletou");
      api.delete(`api/rooms/${id}`, {
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
      {token === null
        ? history.push("/")
        : (<header>
            <img src={logoImg} alt="Logo" />
            <span>Bem vindos ao Hostel</span>

            <Link className="button" to="/room/new">
              Cadastrar novo quarto
            </Link>
            <button type="button">
              <FiPower size={18} color="#E02041" />
            </button>
          </header>)(<h1>Quartos Cadastrados</h1>)(
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <strong>QUARTO {room.number}:</strong>
                  <p>{room.description}</p>

                  <strong>DIMENSÃO:</strong>
                  <p>{room.dimension} m²</p>

                  <strong>LIMITE DE HÓSPEDES:</strong>
                  <p>{room.maxNumberOfGuests} pessoas</p>

                  <strong>VALOR:</strong>
                  <p>R$ {room.dailyRate.price}</p>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    type="button"
                  >
                    <FiTrash2 size={20} color="#a8a8b3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}