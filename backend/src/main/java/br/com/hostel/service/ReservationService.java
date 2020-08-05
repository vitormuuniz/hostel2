package br.com.hostel.service;

import java.net.URI;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.hostel.controller.dto.ReservationDto;
import br.com.hostel.controller.form.ReservationForm;
import br.com.hostel.model.Room;
import br.com.hostel.model.CheckinCheckoutDates;
import br.com.hostel.model.Customer;
import br.com.hostel.model.Reservation;
import br.com.hostel.repository.CheckInCheckOutDateRepository;
import br.com.hostel.repository.CustomerRepository;
import br.com.hostel.repository.PaymentsRepository;
import br.com.hostel.repository.ReservationRepository;
import br.com.hostel.repository.RoomRepository;

@Service
public class ReservationService {

	@Autowired
	private ReservationRepository reservationRepository;

	@Autowired
	private PaymentsRepository paymentsRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private CustomerRepository customerRepository;
	
	@Autowired
	private CheckInCheckOutDateRepository checkInCheckOutDateRepository;

	public ResponseEntity<ReservationDto> registerReservation(ReservationForm form, UriComponentsBuilder uriBuilder) {
		Reservation reservation = form.returnReservation(paymentsRepository, roomRepository);
		Optional<Customer> customerOp = customerRepository.findById(reservation.getCustomer_ID());
		
		if (customerOp.isPresent()) {
			Set<Room> rooms = reservation.getRooms();

			for (Room room : rooms) {
				for (CheckinCheckoutDates c : room.getCheckinCheckoutList()) {
					List<LocalDate> dates = Stream.iterate(c.getCheckIn(), date -> date.plusDays(1))
							.limit(ChronoUnit.DAYS.between(c.getCheckIn(), c.getCheckOut()))
							.collect(Collectors.toList());
					if (dates.contains(reservation.getCheckinDate()) || dates.contains(reservation.getCheckoutDate())) {
						return ResponseEntity.badRequest().build();
					}
				}
			}
			CheckinCheckoutDates dateOK = new CheckinCheckoutDates(reservation.getCheckinDate(), reservation.getCheckoutDate());
			checkInCheckOutDateRepository.save(dateOK);

			for (Room room : rooms) { 
				room.addCheckinCheckoutDate(dateOK);
				roomRepository.save(room);
			}
			
			reservation.setRooms(rooms);
			Customer customer = customerOp.get();
		
			reservationRepository.save(reservation);
			customer.addReservation(reservation);
			customerRepository.save(customer);
			URI uri = uriBuilder.path("/reservations/{id}").buildAndExpand(customer.getId()).toUri();
			
			return ResponseEntity.created(uri).body(new ReservationDto(reservation));
		}
		return ResponseEntity.notFound().build();
	}

	public ResponseEntity<List<ReservationDto>> listAllReservations(String name, Pageable pagination) {

		List<ReservationDto> response = new ArrayList<>();

		if (name == null)
			response = ReservationDto.converter(reservationRepository.findAll());
		else {
			List<Customer> customerList = customerRepository.findByName(name);
			if (!customerList.isEmpty()) {
				List<Reservation> reservations = customerList.get(0).getReservations().stream()
						.collect(Collectors.toList());

				response = ReservationDto.converter(reservations);
			}
		}

		if (response.isEmpty())
			return ResponseEntity.notFound().build();
		else
			return ResponseEntity.ok(response);
	}

	public ResponseEntity<ReservationDto> listOneReservation(Long id) {
		Optional<Reservation> reservation = reservationRepository.findById(id);

		if (reservation.isPresent())
			return ResponseEntity.ok(new ReservationDto(reservation.get()));
		else
			return ResponseEntity.notFound().build();
	}

	public ResponseEntity<?> deleteReservation(Long id) {
		Optional<Reservation> reservation = reservationRepository.findById(id);

		if (reservation.isPresent()) {
			reservationRepository.deleteById(id);

			return ResponseEntity.ok().build();
		} else
			return ResponseEntity.notFound().build();
	}

}
