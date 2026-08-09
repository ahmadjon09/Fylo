import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('fylo:location')||'null'); } catch { return null; }
  });
  const [permission, setPermission] = useState('unknown');
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPermission('unsupported');
      return Promise.reject('Geolocation not supported');
    }
    setLoading(true);
    return new Promise((resolve, reject)=>{
      navigator.geolocation.getCurrentPosition(
        (pos)=>{
          const loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          };
          // Try reverse geocode via openstreetmap nominatim (fire-and-forget)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}&zoom=10`, { headers:{ 'Accept-Language':'uz' } })
            .then(r=>r.json())
            .then(data=>{
              loc.city = data.address?.city || data.address?.town || '';
              loc.country = data.address?.country || '';
              loc.address = data.display_name || '';
              setLocation(loc);
              localStorage.setItem('fylo:location', JSON.stringify(loc));
              // Send to socket if available
              try {
                const { getSocket } = require('../lib/socket');
                const s = getSocket();
                if (s?.connected) s.emit('location:update', loc);
              } catch {}
              resolve(loc);
            })
            .catch(()=>{
              setLocation(loc);
              localStorage.setItem('fylo:location', JSON.stringify(loc));
              resolve(loc);
            })
            .finally(()=>{
              setLoading(false);
              setPermission('granted');
            });
        },
        (err)=>{
          setLoading(false);
          setPermission('denied');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5*60*1000 }
      );
    });
  };

  const clearLocation = ()=>{
    setLocation(null);
    localStorage.removeItem('fylo:location');
  };

  // Auto-request on mount if not asked before, after 3s delay
  useEffect(()=>{
    const asked = localStorage.getItem('fylo:location:asked');
    if (!asked && !location) {
      const t = setTimeout(()=>{
        // Don't auto-ask aggressively, just set flag
        localStorage.setItem('fylo:location:asked', '1');
      }, 5000);
      return ()=>clearTimeout(t);
    }
  },[]);

  return { location, permission, loading, requestLocation, clearLocation };
};
