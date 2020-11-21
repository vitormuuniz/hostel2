import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { AiFillPlusSquare, AiFillCheckSquare } from "react-icons/ai";

import logoImg from "../../assets/images/logo.png";
import api from "../../services/api";

export default function UpdateSelectAvailableRooms() {
  const [rooms, setRoom] = useState([]);
  const token = sessionStorage.getItem("token");
  const checkinDate = sessionStorage.getItem("checkinDate");
  const checkoutDate = sessionStorage.getItem("checkoutDate");
  const numberOfGuests = sessionStorage.getItem("numberOfGuests");
  const reservation_id = sessionStorage.getItem("reservation_id");

  const [selectedItems, setSelectedItems] = useState([]);

  const history = useHistory();

  useEffect(() => {
    api.delete(`api/reservations/deleteRoomsReservation/${reservation_id}`, {
      headers: {
        Authorization: "Bearer " + token,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });

    api
      .get("api/rooms", {
        headers: { Authorization: "Bearer " + token },
        params: {
          checkinDate,
          checkoutDate,
          numberOfGuests,
        },
      })
      .then((response) => {
        setRoom(response.data);
      });
  });

  var [count, setCount] = useState(Array(rooms.length).fill(false));

  function handleSelectRoom(id, index) {
    const alreadySelected = selectedItems.findIndex((rooms) => rooms === id);

    count.splice(index, 1, !count[index]);
    setCount(count);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((rooms) => rooms !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  if (token === null) {
    history.push("/");
    return <div></div>;
  } else {
    return (
      <div className="profile-container">
        <header>
          <img src={logoImg} alt="Logo" />
          <span>Bem vindo ao Hostel</span>

          <Link className="button" to="/payments/updateSelectPayment">
            Selecionar forma de pagamento
          </Link>
        </header>

        <h1>Quartos Disponiveis</h1>

        <ul>
          {rooms.map((room, j) => (
            <li key={room.id}>
              <strong>QUARTO {room.number}:</strong>
              <p>{room.description}</p>

              <strong>DIMENSÃO:</strong>
              <p>{room.dimension} m²</p>

              <strong>LIMITE DE HÓSPEDES:</strong>
              <p>{room.maxNumberOfGuests} pessoas</p>

              <strong>VALOR:</strong>
              <p>R$ {room.dailyRate.price},00</p>

              <button
                type="button"
                onClick={() => {
                  handleSelectRoom(room.id);
                }}
              >
                {selectedItems.includes(room.id) ? (
                  <AiFillCheckSquare size="28px" color="#999" />
                ) : (
                  <AiFillPlusSquare size="28px" color="#999" />
                )}
              </button>
            </li>
          ))}
          {sessionStorage.setItem("rooms_ID", JSON.stringify(selectedItems))}
        </ul>
      </div>
    );
  }
}