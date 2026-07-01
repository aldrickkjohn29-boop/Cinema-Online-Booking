import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import './App.css'

const movies = [
  { id: 1, name: 'The Last Guardian', genre: 'Sci-Fi', rating: '8.5/10' },
  { id: 2, name: 'Dark Legends', genre: 'Horror', rating: '7.2/10' },
  { id: 3, name: 'Love in Paris', genre: 'Romance', rating: '6.8/10' },
  { id: 4, name: 'Action Heroes', genre: 'Action', rating: '8.9/10' },
]

const timeSlots = ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM']
const prices = {
  standard: 150,
  premium: 200,
  vip: 300,
}

const db = getFirestore()
const bookingsCollection = collection(db, 'bookings')

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookings, setBookings] = useState([])
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const snapshot = await getDocs(bookingsCollection)
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        setBookings(items)
      } catch (error) {
        console.error('Failed to load bookings:', error)
        setFeedbackMessage('Could not load bookings from Firebase.')
      }
    }

    loadBookings()
  }, [])

  const generateSeats = () => {
    const rows = 8
    const cols = 12
    const seats = []
    const reservedSeats = [5, 12, 18, 25, 31, 37, 43, 49, 55, 61, 67, 73]

    for (let i = 1; i <= rows * cols; i++) {
      seats.push({
        id: i,
        number: i,
        row: String.fromCharCode(64 + Math.ceil(i / cols)),
        col: ((i - 1) % cols) + 1,
        type: i % 3 === 0 ? 'vip' : i % 2 === 0 ? 'premium' : 'standard',
        booked: reservedSeats.includes(i),
      })
    }
    return seats
  }

  const seats = generateSeats()

  const toggleSeatSelection = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat) return

    if (seat.booked && !selectedSeats.includes(seatId)) {
      return
    }

    setSelectedSeats((current) => {
      if (current.includes(seatId)) {
        return current.filter((id) => id !== seatId)
      }
      return [...current, seatId]
    })
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return total + (seat ? prices[seat.type] : 0)
    }, 0)
  }

  const getSeatLabel = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    return seat ? `${seat.row}${seat.col}` : ''
  }

  const getSeatLabels = (seatIds = []) => seatIds.map(getSeatLabel).filter(Boolean).join(', ')

  const resetBookingForm = () => {
    setSelectedMovie(null)
    setSelectedTime(null)
    setSelectedSeats([])
    setCustomerName('')
    setCustomerEmail('')
    setEditingBookingId(null)
    setBookingComplete(false)
    setFeedbackMessage('')
  }

  const handleReset = () => {
    resetBookingForm()
  }

  const handleBooking = async () => {
    if (!selectedMovie || !selectedTime || selectedSeats.length === 0 || !customerName || !customerEmail) {
      alert('Please fill all the fields and select seats!')
      return
    }

    const selectedMovieName = movies.find((movie) => movie.id === selectedMovie)?.name || 'Unknown Movie'

    const bookingPayload = {
      movieId: selectedMovie,
      movieName: selectedMovieName,
      time: selectedTime,
      customerName,
      customerEmail,
      seatIds: selectedSeats,
      total: calculateTotal(),
      createdAt: new Date().toLocaleString(),
    }

    try {
      if (editingBookingId) {
        const bookingRef = doc(db, 'bookings', editingBookingId)
        await updateDoc(bookingRef, bookingPayload)
        setBookings((current) =>
          current.map((booking) => (booking.id === editingBookingId ? { ...booking, ...bookingPayload } : booking)),
        )
        setFeedbackMessage('Booking updated successfully.')
      } else {
        const docRef = await addDoc(bookingsCollection, bookingPayload)
        setBookings((current) => [{ id: docRef.id, ...bookingPayload }, ...current])
        setFeedbackMessage('Booking created successfully.')
      }

      setBookingComplete(true)
    } catch (error) {
      console.error('Failed to save booking:', error)
      setFeedbackMessage('Unable to save booking to Firebase.')
    }
  }

  const handleEditBooking = (bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return

    setSelectedMovie(booking.movieId)
    setSelectedTime(booking.time)
    setSelectedSeats(booking.seatIds)
    setCustomerName(booking.customerName)
    setCustomerEmail(booking.customerEmail)
    setEditingBookingId(bookingId)
    setBookingComplete(false)
    setFeedbackMessage(`Editing ${booking.customerName}'s booking.`)
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return

    try {
      await deleteDoc(doc(db, 'bookings', bookingId))
      setBookings((current) => current.filter((booking) => booking.id !== bookingId))
      if (editingBookingId === bookingId) {
        resetBookingForm()
      }
      setFeedbackMessage('Booking deleted successfully.')
    } catch (error) {
      console.error('Failed to delete booking:', error)
      setFeedbackMessage('Unable to delete booking from Firebase.')
    }
  }

  const handleBackToBookings = () => {
    setBookingComplete(false)
    setFeedbackMessage('Booking management is ready.')
  }

  if (bookingComplete) {
    return (
      <div className="booking-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>{editingBookingId ? 'Booking Updated!' : 'Booking Confirmed!'}</h1>
          <div className="booking-details">
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Movie:</strong> {movies.find((movie) => movie.id === selectedMovie)?.name}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Seats:</strong> {getSeatLabels(selectedSeats)}</p>
            <p className="total-price"><strong>Total Price:</strong> ₱ {calculateTotal()}</p>
          </div>
          <div className="success-actions">
            <button className="reset-btn" onClick={handleBackToBookings}>
              Manage Bookings
            </button>
            <button className="secondary-btn" onClick={handleReset}>
              Book Another Ticket
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-container">
      <header className="booking-header">
        <h1>🎬 Cinema Ticket Booking</h1>
        <p>Book your favorite movie easily!</p>
      </header>

      <div className="booking-wrapper">
        <div className="left-section">
          <div className="card movie-card">
            <h2>Select Movie</h2>
            <div className="movies-grid">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className={`movie-item ${selectedMovie === movie.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMovie(movie.id)}
                >
                  <div className="movie-poster">{movie.name.charAt(0)}</div>
                  <h3>{movie.name}</h3>
                  <p className="genre">{movie.genre}</p>
                  <p className="rating">⭐ {movie.rating}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Select Time</h2>
            <div className="time-grid">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>{editingBookingId ? 'Update Booking Details' : 'Your Details'}</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="right-section">
          <div className="card seat-card">
            <h2>Select Seats</h2>
            <div className="screen">SCREEN</div>

            <div className="seats-container">
              {Array.from({ length: 8 }).map((_, rowIdx) => {
                const rowSeats = seats.filter((seat) => Math.ceil(seat.id / 12) === rowIdx + 1)
                const leftSeats = rowSeats.slice(0, 3)
                const middleSeats = rowSeats.slice(3, 9)
                const rightSeats = rowSeats.slice(9, 12)
                const isDisabilityRow = rowIdx === 0
                const rowLabel = String.fromCharCode(65 + rowIdx)

                return (
                  <div key={rowIdx} className="seat-row">
                    <div className={`row-label ${isDisabilityRow ? 'disability-row-label' : ''}`} title={isDisabilityRow ? 'Disability Access Row' : ''}>
                      {isDisabilityRow ? `${rowLabel} ♿` : rowLabel}
                    </div>

                    <div className="seat-section left-section-seats">
                      {leftSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${selectedSeats.includes(seat.id) ? 'selected' : ''} ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked && !selectedSeats.includes(seat.id)}
                          title={`${seat.row}${seat.col}`}
                        >
                          {seat.col}
                        </button>
                      ))}
                    </div>

                    <div className="aisle-separator"></div>

                    <div className="seat-section middle-section-seats">
                      {middleSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${selectedSeats.includes(seat.id) ? 'selected' : ''} ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked && !selectedSeats.includes(seat.id)}
                          title={`${seat.row}${seat.col}`}
                        >
                          {seat.col}
                        </button>
                      ))}
                    </div>

                    <div className="aisle-separator"></div>

                    <div className="seat-section right-section-seats">
                      {rightSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${selectedSeats.includes(seat.id) ? 'selected' : ''} ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked && !selectedSeats.includes(seat.id)}
                          title={`${seat.row}${seat.col}`}
                        >
                          {seat.col}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="booking-summary">
        <div className="summary-card">
          <h3>Booking Summary</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Selected Seats:</span>
              <strong>
                {selectedSeats.length === 0 ? 'None' : getSeatLabels(selectedSeats)}
              </strong>
            </div>
            <div className="summary-row">
              <span>Movie:</span>
              <strong>{selectedMovie ? movies.find((movie) => movie.id === selectedMovie)?.name : 'Not selected'}</strong>
            </div>
            <div className="summary-row">
              <span>Time:</span>
              <strong>{selectedTime || 'Not selected'}</strong>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <strong>₱ {calculateTotal()}</strong>
            </div>
          </div>
          <button className="book-btn" onClick={handleBooking}>
            {editingBookingId ? 'Update Booking' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      <div className="card manage-card">
        <div className="manage-header">
          <h2>{editingBookingId ? 'Manage Existing Bookings' : 'Manage Bookings'}</h2>
          <button className="secondary-btn" onClick={handleReset}>
            New Booking
          </button>
        </div>
        {feedbackMessage ? <p className="feedback-message">{feedbackMessage}</p> : null}
        {bookings.length === 0 ? (
          <p className="empty-state">No bookings yet. Create your first booking above.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-item-main">
                  <h3>{booking.customerName}</h3>
                  <p><strong>Movie:</strong> {booking.movieName}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Seats:</strong> {getSeatLabels(booking.seatIds)}</p>
                  <p><strong>Total:</strong> ₱ {booking.total}</p>
                  <p className="booking-meta">Booked on {booking.createdAt}</p>
                </div>
                <div className="booking-actions">
                  <button className="action-btn edit" onClick={() => handleEditBooking(booking.id)}>
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteBooking(booking.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
