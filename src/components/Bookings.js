import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FaTrash } from "react-icons/fa";
import "../styles/Bookings.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const TodayBookingsCard = ({ todayBookings, selectedDate, onDateChange }) => {
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Today";

  return (
    <div className="card shadow-sm mb-4 d-flex flex-row">
      <div className="p-3">
        <Calendar
          value={selectedDate}
          onClickDay={onDateChange}
          className="custom-calendar"
        />
      </div>
      <div className="card-body flex-grow-1">
        <h5 className="card-title text-primary">
          Appointments for {formattedDate}
        </h5>
        <p className="card-subtitle mb-2 text-muted">
          Total: {todayBookings.length}
        </p>
        <ul className="list-group list-group-flush mb-3">
          {todayBookings.length > 0 ? (
            todayBookings.map((booking) => (
              <li key={booking.id} className="list-group-item">
                {booking.clientName} - {booking.time} ({booking.serviceOrdered})
              </li>
            ))
          ) : (
            <li className="list-group-item">No appointments for this date.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const BookingTable = ({ bookings, handleAccept, handleCancel, handleDelete }) => (
  <div className="table-responsive">
    <table className="table table-hover table-bordered shadow-sm">
      <thead className="table-light">
        <tr>
          <th>Customer Name</th>
          <th>Service Ordered</th>
          <th>Barber Assigned</th>
          <th>Style Ordered</th>
          <th>Booking Date</th>
          <th>Booking Time</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{booking.clientName}</td>
            <td>{booking.serviceOrdered}</td>
            <td>{booking.barberName}</td>
            <td>{booking.styleOrdered}</td>
            <td>{new Date(booking.date).toLocaleDateString()}</td>
            <td>{booking.time}</td>
            <td>
              <span
                className={`badge ${
                  booking.status === "confirmed"
                    ? "bg-success"
                    : booking.status === "pending"
                    ? "bg-warning"
                    : "bg-secondary"
                }`}
              >
                {booking.status}
              </span>
            </td>
            <td>
              {booking.status === "pending" && (
                <>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleAccept(booking.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(booking.id)}
              >
                <FaTrash className="me-2" />
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;

      if (user) {
        const barbershopId = user.uid;
        const bookingsCollection = collection(db, "bookings");
        const bookingsQuery = query(
          bookingsCollection,
          where("barbershopId", "==", barbershopId)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setBookings(bookingsList);

        const todayDate = new Date().toDateString();
        setTodayBookings(bookingsList.filter(
          (booking) => new Date(booking.date).toDateString() === todayDate
        ));
      }
    };

    fetchBookings();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTodayBookings(
      bookings.filter(
        (booking) => new Date(booking.date).toDateString() === date.toDateString()
      )
    );
  };

  const updateBookingStatus = async (bookingId, status) => {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { status });
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const handleAccept = (bookingId) => updateBookingStatus(bookingId, "confirmed");
  const handleCancel = (bookingId) => updateBookingStatus(bookingId, "canceled");

  const handleDelete = async (bookingId) => {
    const bookingRef = doc(db, "bookings", bookingId);
    await deleteDoc(bookingRef);
    setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
  };

  const confirmAction = async () => {
    if (selectedBooking) {
      const { id, action } = selectedBooking;
      action === "accept" ? handleAccept(id) : handleCancel(id);
      setSelectedBooking(null);
    }
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      await handleDelete(bookingToDelete);
      setBookingToDelete(null);
    }
  };

  return (
    <div className="queue-container">
      <TodayBookingsCard
        todayBookings={todayBookings}
        selectedDate={selectedDate}
        onDateChange={handleDateClick}
      />
      <BookingTable
        bookings={bookings}
        handleAccept={(id) => setSelectedBooking({ id, action: "accept" })}
        handleCancel={(id) => setSelectedBooking({ id, action: "cancel" })}
        handleDelete={setBookingToDelete}
      />
      {selectedBooking && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBooking(null)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to {selectedBooking.action} this booking?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedBooking(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {bookingToDelete && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBookingToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this booking? This action can not be undone.
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
