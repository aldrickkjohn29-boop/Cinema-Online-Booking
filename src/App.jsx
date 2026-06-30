import { useState } from 'react'
import './App.css'

function App() {
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

  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [seatType, setSeatType] = useState('standard')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [bookingComplete, setBookingComplete] = useState(false)

  // Generate seat map (8 rows x 12 columns)
  const generateSeats = () => {
    const rows = 8
    const cols = 12
    const seats = []
    const reservedSeats = [5, 12, 18, 25, 31, 37, 43, 49, 55, 61, 67, 73] // Some pre-booked seats

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
    if (seat.booked) return

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return total + prices[seat.type]
    }, 0)
  }

  const handleBooking = () => {
    if (!selectedMovie || !selectedTime || selectedSeats.length === 0 || !customerName || !customerEmail) {
      alert('Please fill all the fields and select seats!')
      return
    }
    setBookingComplete(true)
  }

  const handleReset = () => {
    setSelectedMovie(null)
    setSelectedTime(null)
    setSelectedSeats([])
    setSeatType('standard')
    setCustomerName('')
    setCustomerEmail('')
    setBookingComplete(false)
  }

  if (bookingComplete) {
    return (
      <div className="booking-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Booking Confirmed!</h1>
          <div className="booking-details">
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Movie:</strong> {movies.find((m) => m.id === selectedMovie)?.name}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Seats:</strong> {selectedSeats.map((id) => {
              const seat = seats.find((s) => s.id === id)
              return `${seat.row}${seat.col}`
            }).join(', ')}</p>
            <p className="total-price"><strong>Total Price:</strong> ₱ {calculateTotal()}</p>
          </div>
          <button className="reset-btn" onClick={handleReset}>
            Book Another Ticket
          </button>
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
        {/* Left Section - Movie Selection */}
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
            <h2>Your Details</h2>
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

        {/* Right Section - Seat Selection */}
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
                    
                    {/* Left section (3 seats) */}
                    <div className="seat-section left-section-seats">
                      {leftSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${
                            selectedSeats.includes(seat.id) ? 'selected' : ''
                          } ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked}
                          title={`${seat.row}${seat.col}`}
                        >
                          {seat.col}
                        </button>
                      ))}
                    </div>

                    {/* Aisle separator */}
                    <div className="aisle-separator"></div>

                    {/* Middle section (6 seats) */}
                    <div className="seat-section middle-section-seats">
                      {middleSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${
                            selectedSeats.includes(seat.id) ? 'selected' : ''
                          } ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked}
                          title={`${seat.row}${seat.col}`}
                        >
                          {seat.col}
                        </button>
                      ))}
                    </div>

                    {/* Aisle separator */}
                    <div className="aisle-separator"></div>

                    {/* Right section (3 seats) */}
                    <div className="seat-section right-section-seats">
                      {rightSeats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`seat ${seat.type}-seat ${
                            selectedSeats.includes(seat.id) ? 'selected' : ''
                          } ${seat.booked ? 'booked' : ''}`}
                          onClick={() => toggleSeatSelection(seat.id)}
                          disabled={seat.booked}
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

      {/* Booking Summary */}
      <div className="booking-summary">
        <div className="summary-card">
          <h3>Booking Summary</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Selected Seats:</span>
              <strong>
                {selectedSeats.length === 0
                  ? 'None'
                  : selectedSeats
                      .map((id) => {
                        const seat = seats.find((s) => s.id === id)
                        return `${seat.row}${seat.col}`
                      })
                      .join(', ')}
              </strong>
            </div>
            <div className="summary-row">
              <span>Movie:</span>
              <strong>{selectedMovie ? movies.find((m) => m.id === selectedMovie)?.name : 'Not selected'}</strong>
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
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
