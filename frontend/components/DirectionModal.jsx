'use client';

import React, { useState, useEffect } from 'react';
import BoxModal from './ui/BoxModal';
import MapView from './MapView';
import Skeleton from './ui/Skeleton';
import { api } from '@/lib/api';
import { Navigation, Clock, MapPin, AlertTriangle } from 'lucide-react';

export default function DirectionModal({ isOpen, onClose, bookingId }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      setLoading(true);
      setError(null);
      api.get(`/bookings/${bookingId}/route`)
        .then((res) => {
          if (res?.success && res.data) {
            setRouteData(res.data);
          } else {
            setError(res?.message || 'Could not calculate navigation route');
          }
        })
        .catch((err) => {
          setError(err.message || 'Route service unavailable or location not shared by booker.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, bookingId]);

  return (
    <BoxModal isOpen={isOpen} onClose={onClose} title="Booker Navigation & Directions" maxWidth="max-w-3xl">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-16 rounded-2xl" />
          <Skeleton className="w-full h-[360px] rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-text">Navigation Info Unavailable</h4>
          <p className="text-xs text-text-muted">{error}</p>
        </div>
      ) : routeData ? (
        <div className="space-y-4">
          {/* Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 border border-border rounded-2xl bg-surface-alt/40 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-text-muted block">Total Distance</span>
                <span className="text-sm font-bold text-text">{routeData.route.distance_text}</span>
              </div>
            </div>

            <div className="p-3.5 border border-border rounded-2xl bg-surface-alt/40 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-text-muted block">Estimated Time</span>
                <span className="text-sm font-bold text-text">{routeData.route.duration_text}</span>
              </div>
            </div>

            <div className="p-3.5 border border-border rounded-2xl bg-surface-alt/40 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-text-muted block">Booker</span>
                <span className="text-sm font-bold text-text truncate block">{routeData.booker.name}</span>
              </div>
            </div>
          </div>

          {/* Map with Route Polyline */}
          <div className="w-full h-[360px] border border-border rounded-2xl overflow-hidden shadow-sm">
            <MapView
              center={routeData.house.coordinates}
              zoom={13}
              routeCoordinates={routeData.route.coordinates}
              droppedPin={routeData.booker.coordinates}
              searchCenter={routeData.house.coordinates}
              height="360px"
            />
          </div>

          {/* Turn-by-Turn Waypoints */}
          {routeData.route.steps && routeData.route.steps.length > 0 && (
            <div className="border border-border rounded-2xl p-4 bg-surface max-h-44 overflow-y-auto shadow-sm">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-text mb-2.5">
                Turn-by-Turn Waypoints & Route Guidance
              </h5>
              <div className="divide-y divide-border/60 text-xs">
                {routeData.route.steps.map((step, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-text-muted">
                    <span className="font-medium text-text">
                      {idx + 1}. {step.instruction} on {step.name}
                    </span>
                    <span className="font-mono text-[11px] shrink-0 text-primary font-semibold">
                      {step.distance_meters} m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </BoxModal>
  );
}
