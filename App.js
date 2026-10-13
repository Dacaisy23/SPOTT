import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Platform } from 'react-native';

const PIN_TYPES = [
  { id: 'police', label: 'POLICE', color: '#FF0000' },
  { id: 'control', label: 'CONTROL', color: '#FF6600' },
  { id: 'accident', label: 'ACCIDENT', color: '#FF0000' },
  { id: 'fire', label: 'FIRE', color: '#FF4500' },
  { id: 'fish', label: 'FISH', color: '#0066FF' },
  { id: 'bushmeat', label: 'BUSH MEAT', color: '#8B4513' },
  { id: 'market', label: 'MARKET', color: '#00A651' },
];

export default function App() {
  const [pins, setPins] = useState([
    { id: 1, lat: 4.15, lng: 9.24, type: 'police', desc: 'Test - Buea' },
  ]);
  const [pendingPos, setPendingPos] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState('police');
  const [desc, setDesc] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize map for web
  useEffect(() => {
    if (Platform.OS!== 'web') return;

    const initMap = () => {
      if (!window.L ||!document.getElementById('map')) return;
      if (mapInstanceRef.current) return;

      const L = window.L;
      const map = L.map('map').setView([5.5, 12.2], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
      }).addTo(map);

      map.on('click', (e) => {
        setPendingPos({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowAdd(true);
      });

      mapInstanceRef.current = map;
      updateMarkers();
    };

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Update markers when pins change
  const updateMarkers = () => {
    if (!mapInstanceRef.current ||!window.L) return;
    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];
    pins.forEach(p => {
      const marker = window.L.marker([p.lat, p.lng]).addTo(mapInstanceRef.current);
      marker.bindPopup(`<b>${p.type.toUpperCase()}</b><br>${p.desc}`);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    updateMarkers();
  }, [pins]);

  const addPin = () => {
    if (!pendingPos) return;
    const newPin = { id: Date.now(), lat: pendingPos.lat, lng: pendingPos.lng, type: selectedType, desc: desc || selectedType };
    setPins([...pins, newPin]);
    setDesc('');
    setShowAdd(false);
    setPendingPos(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SPOTT - Cameroon Map</Text>
        <Text style={styles.subtitle}>Buea | Bafoussam | Garoua | Douala | Kribi - Tap map to add pin</Text>
      </View>

      {/* MAP DIV FOR WEB */}
      <View style={styles.mapContainer}>
        <div id="map" style={{ width: '100%', height: '100%' }} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{pins.length} pins - Tap anywhere on map to add</Text>
      </View>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SPOTT THIS PLACE</Text>
            {pendingPos && <Text style={styles.coord}>{pendingPos.lat.toFixed(4)}, {pendingPos.lng.toFixed(4)}</Text>}
            <View style={styles.typeGrid}>
              {PIN_TYPES.map((t) => (
                <TouchableOpacity key={t.id} onPress={() => setSelectedType(t.id)} style={[styles.typeBtn, selectedType === t.id && { backgroundColor: t.color, borderColor: t.color }]}>
                  <Text style={[styles.typeText, selectedType === t.id && { color: 'white' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="E.g. Police control Muea, Fish seller here..." value={desc} onChangeText={setDesc} style={styles.input} />
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={[styles.btn, { backgroundColor: '#eee' }]}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={addPin} style={[styles.btn, { backgroundColor: '#0066FF' }]}><Text style={{ color: 'white', fontWeight: '900' }}>ADD PIN</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', height: '100vh' },
  header: { paddingTop: 50, paddingBottom: 10, paddingHorizontal: 15, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: '900', color: '#0066FF' },
  subtitle: { fontSize: 11, color: '#00A651', fontWeight: '700', marginTop: 4 },
  mapContainer: { flex: 1, backgroundColor: '#d4e6ff' },
  footer: { padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  footerText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  coord: { fontSize: 10, color: 'gray', marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  typeText: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
});
