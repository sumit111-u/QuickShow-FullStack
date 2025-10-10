import React, { useState, useEffect } from 'react';
import { Check, X, User, Crown, Star, Info } from 'lucide-react';

const SeatChart = ({ 
  occupiedSeats = [], 
  onSeatSelect, 
  selectedSeats = [], 
  maxSeats = 10,
  showPricing = true,
  seatPricing = {
    premium: 350,
    regular: 250,
    economy: 150
  }
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  
  // Professional theater layout with different seat categories
  const theaterLayout = {
    premium: {
      rows: ['A', 'B'],
      seatsPerRow: 12,
      startCol: 2, // Center alignment
      price: seatPricing.premium,
      color: 'from-purple-500 to-pink-500',
      icon: Crown
    },
    regular: {
      rows: ['C', 'D', 'E', 'F', 'G'],
      seatsPerRow: 14,
      startCol: 1,
      price: seatPricing.regular,
      color: 'from-blue-500 to-cyan-500',
      icon: Star
    },
    economy: {
      rows: ['H', 'I', 'J', 'K'],
      seatsPerRow: 16,
      startCol: 0,
      price: seatPricing.economy,
      color: 'from-green-500 to-emerald-500',
      icon: User
    }
  };

  const getSeatStatus = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatCategory = (row) => {
    for (const [category, config] of Object.entries(theaterLayout)) {
      if (config.rows.includes(row)) return { category, ...config };
    }
    return null;
  };

  const handleSeatClick = (seatId, category, price) => {
    const status = getSeatStatus(seatId);
    if (status === 'occupied') return;
    
    if (status === 'available' && selectedSeats.length >= maxSeats) {
      return;
    }
    
    onSeatSelect(seatId, category, price, status === 'selected' ? 'deselect' : 'select');
  };

  const renderSeat = (row, seatNum, category) => {
    const seatId = `${row}${seatNum}`;
    const status = getSeatStatus(seatId);
    const seatConfig = getSeatCategory(row);
    const Icon = seatConfig?.icon || User;
    
    const baseClasses = "relative w-8 h-8 rounded-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-110 flex items-center justify-center text-xs font-semibold";
    
    const statusClasses = {
      available: `border-gray-300 bg-white hover:border-${category === 'premium' ? 'purple' : category === 'regular' ? 'blue' : 'green'}-400 hover:shadow-lg`,
      selected: `bg-gradient-to-br ${seatConfig?.color} text-white border-transparent shadow-lg scale-105`,
      occupied: "bg-gray-400 border-gray-500 cursor-not-allowed opacity-60"
    };

    return (
      <div
        key={seatId}
        className={`${baseClasses} ${statusClasses[status]}`}
        onClick={() => handleSeatClick(seatId, category, seatConfig?.price)}
        onMouseEnter={() => setHoveredSeat({ id: seatId, category, price: seatConfig?.price })}
        onMouseLeave={() => setHoveredSeat(null)}
        title={`Seat ${seatId} - ${category.toUpperCase()} (₹${seatConfig?.price})`}
      >
        {status === 'selected' && <Check className="w-4 h-4" />}
        {status === 'occupied' && <X className="w-4 h-4" />}
        {status === 'available' && (
          <span className="text-gray-600">{seatNum}</span>
        )}
      </div>
    );
  };

  const renderRow = (row, category) => {
    const config = theaterLayout[category];
    const seats = [];
    
    // Add left spacing for center alignment
    for (let i = 0; i < config.startCol; i++) {
      seats.push(<div key={`space-${i}`} className="w-8 h-8" />);
    }
    
    // Add seats
    for (let i = 1; i <= config.seatsPerRow; i++) {
      seats.push(renderSeat(row, i, category));
      
      // Add aisle space in the middle
      if (i === Math.floor(config.seatsPerRow / 2)) {
        seats.push(<div key={`aisle-${row}-${i}`} className="w-6" />);
      }
    }
    
    return (
      <div key={row} className="flex items-center justify-center gap-1 mb-2">
        <div className="w-6 text-center text-sm font-semibold text-gray-600 mr-4">
          {row}
        </div>
        {seats}
        <div className="w-6 text-center text-sm font-semibold text-gray-600 ml-4">
          {row}
        </div>
      </div>
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId[0];
      const seatConfig = getSeatCategory(row);
      return total + (seatConfig?.price || 0);
    }, 0);
  };

  const getSeatBreakdown = () => {
    const breakdown = { premium: 0, regular: 0, economy: 0 };
    selectedSeats.forEach(seatId => {
      const row = seatId[0];
      const seatConfig = getSeatCategory(row);
      if (seatConfig) {
        breakdown[seatConfig.category]++;
      }
    });
    return breakdown;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Screen */}
      <div className="mb-8">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full mb-2"></div>
        <div className="text-center text-gray-500 text-sm font-medium">SCREEN</div>
      </div>

      {/* Seat Layout */}
      <div className="mb-8">
        {/* Premium Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <Crown className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-sm font-semibold text-purple-600">PREMIUM - ₹{seatPricing.premium}</span>
          </div>
          {theaterLayout.premium.rows.map(row => renderRow(row, 'premium'))}
        </div>

        {/* Spacing */}
        <div className="h-4"></div>

        {/* Regular Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <Star className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-semibold text-blue-600">REGULAR - ₹{seatPricing.regular}</span>
          </div>
          {theaterLayout.regular.rows.map(row => renderRow(row, 'regular'))}
        </div>

        {/* Spacing */}
        <div className="h-4"></div>

        {/* Economy Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <User className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-semibold text-green-600">ECONOMY - ₹{seatPricing.economy}</span>
          </div>
          {theaterLayout.economy.rows.map(row => renderRow(row, 'economy'))}
        </div>
      </div>

      {/* Legend and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Legend
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-lg mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-2 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-400 rounded-lg mr-2 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm">Occupied</span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Selected Seats:</span>
                <span className="text-sm font-medium">{selectedSeats.join(', ')}</span>
              </div>
              
              {Object.entries(getSeatBreakdown()).map(([category, count]) => 
                count > 0 && (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="capitalize">{category} ({count} seats):</span>
                    <span>₹{count * seatPricing[category]}</span>
                  </div>
                )
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg text-blue-600">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredSeat && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none">
          Seat {hoveredSeat.id} - {hoveredSeat.category.toUpperCase()} - ₹{hoveredSeat.price}
        </div>
      )}

      {/* Selection Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {selectedSeats.length > 0 && (
          <p>
            {selectedSeats.length} of {maxSeats} seats selected
            {selectedSeats.length >= maxSeats && " (Maximum reached)"}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatChart;
