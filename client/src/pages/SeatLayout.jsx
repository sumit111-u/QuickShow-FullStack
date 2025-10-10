import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import SeatChart from '../components/SeatChart'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {

  const {id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [seatDetails, setSeatDetails] = useState([])

  const navigate = useNavigate()

  const {axios, getToken, user} = useAppContext();

  // Professional seat pricing
  const seatPricing = {
    premium: 350,
    regular: 250,
    economy: 150
  };

  const getShow = async () =>{
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success){
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatSelect = (seatId, category, price, action) => {
    if (!selectedTime) {
      return toast("Please select time first")
    }
    
    if (action === 'select') {
      if (selectedSeats.length >= 10) {
        return toast("You can only select up to 10 seats")
      }
      
      setSelectedSeats(prev => [...prev, seatId])
      setSeatDetails(prev => [...prev, { seatId, category, price }])
      setTotalAmount(prev => prev + price)
    } else {
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId))
      setSeatDetails(prev => prev.filter(seat => seat.seatId !== seatId))
      setTotalAmount(prev => prev - price)
    }
  }


  const getOccupiedSeats = async ()=>{
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }


  const bookTickets = async ()=>{
    try {
      if(!user) return toast.error('Please login to proceed')

        if(!selectedTime || !selectedSeats.length) return toast.error('Please select a time and seats');

        const bookingData = {
          showId: selectedTime.showId, 
          selectedSeats,
          seatDetails,
          totalAmount
        };

        const {data} = await axios.post('/api/booking/create', bookingData, {headers: { Authorization: `Bearer ${await getToken()}` }});

        if (data.success){
          window.location.href = data.url;
        }else{
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    getShow()
  },[])

  useEffect(()=>{
    if(selectedTime){
      getOccupiedSeats()
    }
  },[selectedTime])

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      {/* Available Timings */}
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>
          {show.dateTime[date].map((item)=>(
            <div key={item.time} onClick={()=> setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
              <ClockIcon className="w-4 h-4"/>
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Seat Chart */}
      <div className='relative flex-1 max-md:mt-16'>
          <BlurCircle top="-100px" left="-100px"/>
          <BlurCircle bottom="0" right="0"/>
          
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Select Your Seats</h1>
            <p className='text-gray-600'>Choose from Premium, Regular, or Economy seating</p>
          </div>

          <SeatChart
            occupiedSeats={occupiedSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            maxSeats={10}
            seatPricing={seatPricing}
          />

          {selectedSeats.length > 0 && (
            <div className='flex flex-col items-center mt-8'>
              <div className='bg-white rounded-lg shadow-lg p-6 mb-6 max-w-md w-full'>
                <h3 className='text-lg font-semibold mb-3'>Booking Summary</h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Selected Seats:</span>
                    <span className='font-medium'>{selectedSeats.join(', ')}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Total Seats:</span>
                    <span className='font-medium'>{selectedSeats.length}</span>
                  </div>
                  <div className='border-t pt-2 mt-2'>
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total Amount:</span>
                      <span className='text-primary'>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={bookTickets} 
                className='flex items-center gap-2 px-8 py-4 text-lg bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white rounded-full font-semibold cursor-pointer active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                Proceed to Checkout - ₹{totalAmount}
                <ArrowRightIcon strokeWidth={3} className="w-5 h-5"/>
              </button>
            </div>
          )}
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout
