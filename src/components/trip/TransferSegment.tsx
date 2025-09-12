/**
 * TRANSFER SEGMENT COMPONENT
 * 
 * Displays individual transfer segment with seat selection
 */

import React from 'react';
import { Clock, MapPin, Bus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SeatMap from './SeatMap';
import { ChangeLeg, SeatMapData } from '@/types/tripDetail';

interface TransferSegmentProps {
  segment: ChangeLeg;
  segmentIndex: number;
  seatMapData?: SeatMapData;
  selectedSeats: string[];
  maxSeats: number;
  onSeatSelect: (seatNumber: string) => void;
  onSeatDeselect: (seatNumber: string) => void;
  loading?: boolean;
}

const TransferSegment: React.FC<TransferSegmentProps> = ({
  segment,
  segmentIndex,
  seatMapData,
  selectedSeats,
  maxSeats,
  onSeatSelect,
  onSeatDeselect,
  loading = false,
}) => {
  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds if present
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransferTime = () => {
    if (segment.transfer_time) {
      const { d, h, m } = segment.transfer_time;
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);
      return parts.join(' ');
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Segment {segmentIndex + 1}
          </CardTitle>
          <Badge variant="outline">
            {segment.trans === 'bus' ? 'Bus' : segment.trans}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {segment.point_from} → {segment.point_to}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Departure</span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatTime(segment.time_from)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>{formatDate(segment.date_from)}</div>
                <div>{segment.point_from}</div>
                {segment.station_from && (
                  <div className="text-xs text-gray-500">{segment.station_from}</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="font-medium">Arrival</span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{formatTime(segment.time_to)}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>{formatDate(segment.date_to)}</div>
                <div>{segment.point_to}</div>
                {segment.station_to && (
                  <div className="text-xs text-gray-500">{segment.station_to}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Info */}
        {segmentIndex > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <ArrowRight className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Transfer time: {getTransferTime() || 'See details'}
            </span>
            {segment.change_typ && (
              <Badge variant="secondary" className="ml-auto">
                {segment.change_typ === 'auto' ? 'Automatic' : 'Manual'} transfer
              </Badge>
            )}
          </div>
        )}

        {/* Seat Selection */}
        {seatMapData ? (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Select Seats</h4>
              <SeatMap
                seatMapData={seatMapData}
                selectedSeats={selectedSeats}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                onSeatDeselect={onSeatDeselect}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            <Bus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Seat selection not available for this segment</p>
            {segment.free_seats && segment.free_seats.length > 0 && (
              <p className="text-xs mt-1">
                {segment.free_seats.length} seats available
              </p>
            )}
          </div>
        )}

        {/* Free Seats Info */}
        {segment.free_seats && segment.free_seats.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Available seats:</span> {segment.free_seats.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferSegment;
