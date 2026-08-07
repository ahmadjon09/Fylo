import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from '../hooks/useAuth';

export default function AudioCall() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState(null);
  const [active, setActive] = useState(false);
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(()=>{
    const s = getSocket();
    if (!s) return;
    s.on('call:incoming', ({ from })=> setIncoming(from));
    s.on('webrtc:offer', async ({ from, offer })=>{
      setIncoming(from);
      setActive(true);
      const pc = createPC(from);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      s.emit('webrtc:answer', { to: from, answer });
    });
    s.on('webrtc:answer', async ({ answer })=>{
      await pcRef.current?.setRemoteDescription(answer);
    });
    s.on('webrtc:ice-candidate', ({ candidate })=>{
      pcRef.current?.addIceCandidate(candidate).catch(()=>{});
    });
    return ()=>{ s.off('call:incoming'); s.off('webrtc:offer'); s.off('webrtc:answer'); s.off('webrtc:ice-candidate'); };
  },[]);

  const createPC = (to)=>{
    const pc = new RTCPeerConnection({ iceServers:[{ urls:'stun:stun.l.google.com:19302' }] });
    pc.onicecandidate = (e)=>{ if(e.candidate){ getSocket().emit('webrtc:ice-candidate', { to, candidate:e.candidate }); } };
    pc.ontrack = (e)=>{ if(remoteRef.current) remoteRef.current.srcObject = e.streams[0]; };
    pcRef.current = pc;
    return pc;
  };

  const startCall = async (to)=>{
    const s = getSocket();
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    if(localRef.current) localRef.current.srcObject = stream;
    const pc = createPC(to);
    stream.getTracks().forEach(t=> pc.addTrack(t, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    s.emit('webrtc:offer', { to, offer });
    s.emit('call:request', { to });
    setActive(true);
  };

  const endCall = ()=>{
    pcRef.current?.close();
    pcRef.current=null;
    setActive(false);
    setIncoming(null);
    localRef.current && (localRef.current.srcObject=null);
    remoteRef.current && (remoteRef.current.srcObject=null);
  };

  if (!incoming && !active) return null;
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:100, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:16, boxShadow:'var(--shadow-lg)', width:300 }}>
      <div style={{ fontWeight:700, marginBottom:8 }}>{incoming ? `Incoming call from ${incoming}` : 'In Call'}</div>
      <audio ref={localRef} autoPlay muted style={{ display:'none' }} />
      <audio ref={remoteRef} autoPlay />
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        {incoming && !active && <button className="btn btn-primary" onClick={()=>startCall(incoming)}>Answer</button>}
        <button className="btn btn-outline" onClick={endCall}>End</button>
      </div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>Browser-to-browser via WebRTC, server only signals</div>
    </div>
  );
}
