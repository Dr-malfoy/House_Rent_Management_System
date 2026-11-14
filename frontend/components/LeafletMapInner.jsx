'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { formatBDT } from '@/lib/utils';

// Defensive default marker fix
if (typeof window !== 'undefined' && L?.Icon?.Default?.prototype) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Dynamically updates map center & zoom with smooth flyTo animation when area changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  const prevTargetRef = useRef(null);

  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      const target = [Number(center[0]), Number(center[1])];
      const targetZoom = Number(zoom) || 14;

      if (!prevTargetRef.current) {
        map.setView(target, targetZoom);
        prevTargetRef.current = target;
        return;
      }

      const [pLat, pLng] = prevTargetRef.current;
      // If coordinates or zoom significantly changed, perform a smooth flight
      if (
        Math.abs(pLat - target[0]) > 0.0001 ||
        Math.abs(pLng - target[1]) > 0.0001 ||
        map.getZoom() !== targetZoom
      ) {
        map.flyTo(target, targetZoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
        prevTargetRef.current = target;
      }
    }
  }, [center, zoom, map]);

  return null;
}

// Automatically triggers invalidateSize to eliminate blank/grey tiles
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);
    const t4 = setTimeout(() => map.invalidateSize(), 1200);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

// Intercepts wheel & trackpad pinch gestures to zoom the map and PREVENT browser software zoom!
function WheelZoomHandler() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.enable();
    const container = map.getContainer();
    if (!container) return;

    let lastZoomTime = 0;

    const onWheel = (e) => {
      // Always stop propagation so outer document/smooth scroll is never triggered
      e.stopPropagation();

      // If ctrlKey is pressed (Windows Precision Touchpad pinch gesture or Ctrl + MouseWheel)
      if (e.ctrlKey) {
        // PREVENT default browser software/page zoom!
        e.preventDefault();

        const now = Date.now();
        if (now - lastZoomTime > 40) {
          lastZoomTime = now;
          if (e.deltaY < 0) {
            map.zoomIn(0.5);
          } else if (e.deltaY > 0) {
            map.zoomOut(0.5);
          }
        }
      }
    };

    const onGesture = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener('wheel', onWheel, { capture: true, passive: false });
    container.addEventListener('gesturestart', onGesture, { capture: true, passive: false });
    container.addEventListener('gesturechange', onGesture, { capture: true, passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel, { capture: true });
      container.removeEventListener('gesturestart', onGesture, { capture: true });
      container.removeEventListener('gesturechange', onGesture, { capture: true });
    };
  }, [map]);
  return null;
}

// Click listener on map to drop or move pin
function MapClickHandler({ onPinDrop, allowPinDrop, isPinPickedUp, setIsPinPickedUp }) {
  useMapEvents({
    click(e) {
      if (allowPinDrop && onPinDrop) {
        onPinDrop({ lat: e.latlng.lat, lng: e.latlng.lng });
        if (isPinPickedUp && setIsPinPickedUp) {
          setIsPinPickedUp(false);
        }
      }
    },
  });
  return null;
}

// Interactive Bottom-Left Corner Pin Dock: Pick up or drag pin onto map!
function BottomLeftPinDock({ onPinDrop, isPinPickedUp, setIsPinPickedUp }) {
  const map = useMap();
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleStartDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setCursorPos({ x: e.clientX, y: e.clientY });

    const handleMouseMove = (ev) => {
      setCursorPos({ x: ev.clientX, y: ev.clientY });
    };

    const handleMouseUp = (ev) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);

      const container = map.getContainer();
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Check if dropped inside the map canvas
      if (
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom
      ) {
        const point = L.point(ev.clientX - rect.left, ev.clientY - rect.top);
        const latlng = map.containerPointToLatLng(point);
        if (onPinDrop && latlng) {
          onPinDrop({ lat: latlng.lat, lng: latlng.lng });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDockClick = () => {
    if (setIsPinPickedUp) {
      setIsPinPickedUp((prev) => !prev);
    }
  };

  return (
    <>
      {/* Docked Pin at Bottom Left Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          zIndex: 1100,
          pointerEvents: 'auto',
        }}
      >
        <div
          onMouseDown={handleStartDrag}
          onClick={handleDockClick}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-2xl cursor-grab active:cursor-grabbing hover:border-red-400 hover:shadow-red-500/20 hover:scale-105 transition-all select-none ${
            isPinPickedUp ? 'ring-2 ring-red-500 border-red-500 scale-105 shadow-red-500/30' : ''
          }`}
          title="Drag this pin onto any spot on the map, or click to pick up"
        >
          {/* Animated 3D Pin Icon in Dock */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl leading-none select-none">📍</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>

          <div className="text-left pr-1">
            <div className="text-xs font-bold text-text flex items-center gap-1.5">
              <span>{isPinPickedUp ? 'Pin in Hand' : 'Drop Pin Tool'}</span>
            </div>
            <p className="text-[10px] text-text-muted font-medium whitespace-nowrap">
              {isPinPickedUp ? 'Click map to plant' : 'Drag onto map or click'}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Ghost Pin following cursor during drag */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 99999,
          }}
          className="flex flex-col items-center animate-bounce"
        >
          <div className="text-4xl filter drop-shadow-2xl">📍</div>
          <div className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg mt-0.5 whitespace-nowrap">
            Release to drop pin
          </div>
        </div>
      )}

      {/* Picked-Up Pin Banner */}
      {isPinPickedUp && (
        <div
          style={{
            position: 'absolute',
            top: '74px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1250,
            pointerEvents: 'none',
          }}
          className="bg-red-600 text-white px-4 py-1.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce"
        >
          <span>📍</span>
          <span>Pin Picked Up — Click anywhere on the map to drop it!</span>
        </div>
      )}
    </>
  );
}

export default function LeafletMapInner({
  center = [23.8103, 90.4125], // Default Dhaka center
  zoom = 13,
  houses = [],
  activeHouseId = null,
  radius = null, // in meters
  searchCenter = null, // [lat, lng]
  allowPinDrop = true,
  droppedPin = null, // [lat, lng]
  onPinDrop = null,
  onMarkerClick = null,
  onMarkerHover = null,
  routeCoordinates = null, // Array of [lat, lng]
  isDark = false,
  height = '100%',
  className = '',
}) {
  const [isPinPickedUp, setIsPinPickedUp] = useState(false);

  // Free, high-reliability OpenStreetMap tiles (Direct OpenStreetMap, no API key required)
  const osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Defensive sanitization of coordinates
  const validCenter = useMemo(() => {
    if (Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      return [Number(center[0]), Number(center[1])];
    }
    return [23.8103, 90.4125];
  }, [center]);

  const validDroppedPin = useMemo(() => {
    if (Array.isArray(droppedPin) && !isNaN(droppedPin[0]) && !isNaN(droppedPin[1])) {
      return [Number(droppedPin[0]), Number(droppedPin[1])];
    }
    return null;
  }, [droppedPin]);

  const validSearchCenter = useMemo(() => {
    if (validDroppedPin) return validDroppedPin;
    if (Array.isArray(searchCenter) && !isNaN(searchCenter[0]) && !isNaN(searchCenter[1])) {
      return [Number(searchCenter[0]), Number(searchCenter[1])];
    }
    return null;
  }, [searchCenter, validDroppedPin]);

  const validRoute = useMemo(() => {
    if (Array.isArray(routeCoordinates) && routeCoordinates.length > 0) {
      return routeCoordinates.filter((c) => Array.isArray(c) && !isNaN(c[0]) && !isNaN(c[1]));
    }
    return null;
  }, [routeCoordinates]);

  // Distinct House Icon Generator with SVG house icon & price badge
  const createHouseIcon = (house, isActive) => {
    const rentAmount = parseFloat(house.rent_amount) || 0;
    const rentK = rentAmount ? Math.round(rentAmount / 1000) : '';
    const label = rentK ? `৳${rentK}k` : '৳';

    const bgColor = isActive ? '#57BA29' : '#FFFFFF';
    const textColor = isActive ? '#FFFFFF' : '#1A1D14';
    const borderColor = isActive ? '#3F8A1E' : '#57BA29';
    const houseColor = isActive ? '#FFFFFF' : '#57BA29';

    return L.divIcon({
      className: 'custom-house-marker',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: ${isActive ? 'scale(1.18) translateY(-4px)' : 'scale(1)'};
          transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 180ms ease;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22));
        " class="${isActive ? 'active-pin-pulse' : ''}">
          <div style="
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 9px;
            background-color: ${bgColor};
            color: ${textColor};
            border: 2px solid ${borderColor};
            border-radius: 9999px;
            font-weight: 700;
            font-size: 11px;
            font-family: inherit;
            white-space: nowrap;
          ">
            <!-- House Icon SVG -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${houseColor}" stroke="${houseColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; display: inline-block;">
              <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/>
              <polyline points="9 22 9 12 15 12 15 22" fill="${bgColor}" stroke="${houseColor}"/>
            </svg>
            <span>${label}</span>
          </div>
          <!-- Pointer arrow targeting coordinates -->
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${borderColor};
            margin-top: -1px;
          "></div>
        </div>
      `,
      iconSize: [66, 38],
      iconAnchor: [33, 36],
      popupAnchor: [0, -34],
    });
  };

  // Dropped Pin / Search Location Icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: grab;
          filter: drop-shadow(0 6px 14px rgba(239, 68, 68, 0.5));
          transform: translateY(-8px);
        ">
          <!-- 3D Red Location Marker with Crosshair Target -->
          <div style="
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            border: 2.5px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.45);
          ">
            <div style="
              width: 14px;
              height: 14px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 6px; height: 6px; background: #EF4444; border-radius: 50%;"></div>
            </div>
          </div>
          <!-- Pin ground shadow -->
          <div style="
            width: 18px;
            height: 6px;
            background: rgba(0, 0, 0, 0.28);
            border-radius: 50%;
            margin-top: 4px;
          "></div>
        </div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 44],
      popupAnchor: [0, -42],
    });
  };

  const effectivePin = validDroppedPin || validSearchCenter;

  return (
    <div
      style={{
        height: height || '100%',
        width: '100%',
        cursor: isPinPickedUp ? 'crosshair' : 'default',
      }}
      className={className}
      data-lenis-prevent
    >
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="bottomleft" />
        <ChangeView center={validCenter} zoom={zoom} />
        <MapResizer />
        <WheelZoomHandler />
        <MapClickHandler
          onPinDrop={onPinDrop}
          allowPinDrop={allowPinDrop}
          isPinPickedUp={isPinPickedUp}
          setIsPinPickedUp={setIsPinPickedUp}
        />
        <BottomLeftPinDock
          onPinDrop={onPinDrop}
          isPinPickedUp={isPinPickedUp}
          setIsPinPickedUp={setIsPinPickedUp}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url={osmUrl}
          maxZoom={19}
        />

        {/* Selected Search Location Pin & Radius Circle */}
        {effectivePin && (
          <>
            <Marker
              position={effectivePin}
              icon={createPinIcon()}
              draggable={allowPinDrop}
              eventHandlers={{
                dragend: (e) => {
                  if (onPinDrop) {
                    const latlng = e.target.getLatLng();
                    onPinDrop({ lat: latlng.lat, lng: latlng.lng });
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 text-xs font-sans space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-600">
                    <span>📍</span>
                    <span>Search Center Pin</span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Drag this pin or pick up the pin tool at the bottom-left corner to move it.
                  </p>
                  <div className="pt-1 font-mono text-[10px] text-text-muted bg-surface-alt px-2 py-1 rounded">
                    {effectivePin[0].toFixed(4)}° N, {effectivePin[1].toFixed(4)}° E
                  </div>
                  {radius && (
                    <p className="text-[11px] font-semibold text-[#57BA29] pt-0.5">
                      Current Radius: {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {radius && (
              <Circle
                center={effectivePin}
                radius={radius}
                pathOptions={{
                  color: '#57BA29',
                  fillColor: '#57BA29',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '6, 6',
                }}
              />
            )}
          </>
        )}

        {/* Route Direction Polyline */}
        {validRoute && validRoute.length > 0 && (
          <Polyline
            positions={validRoute}
            pathOptions={{
              color: '#57BA29',
              weight: 4,
              opacity: 0.9,
            }}
          />
        )}

        {/* House Markers with Distinct House Icon & Price */}
        {houses.map((house) => {
          const lat = parseFloat(house.coordinates?.lat ?? house.latitude);
          const lng = parseFloat(house.coordinates?.lng ?? house.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isActive = activeHouseId === house.id;

          return (
            <Marker
              key={house.id}
              position={[lat, lng]}
              icon={createHouseIcon(house, isActive)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(house),
                mouseover: () => onMarkerHover && onMarkerHover(house),
              }}
            >
              <Popup>
                <div className="w-60 p-2 space-y-2 select-none">
                  {house.cover_image && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden mb-1 bg-surface-alt">
                      <img
                        src={house.cover_image}
                        alt={house.title || 'House listing'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-text line-clamp-1">
                      {house.title}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                      <span>📍</span>
                      <span className="line-clamp-1">{house.area_name || house.address_text || house.city || 'Dhaka'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    {house.bedrooms && <span>🛏️ {house.bedrooms} Bed</span>}
                    {house.bathrooms && <span>🚿 {house.bathrooms} Bath</span>}
                    {house.size_sqft && <span>📐 {house.size_sqft} sqft</span>}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                    <div>
                      <span className="text-xs font-bold text-[#57BA29]">
                        {formatBDT(house.rent_amount)}
                      </span>
                      <span className="text-[10px] text-text-muted">/mo</span>
                    </div>

                    <Link
                      href={`/houses/${house.id}`}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#57BA29] text-white hover:bg-[#479E1F] transition-colors"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
