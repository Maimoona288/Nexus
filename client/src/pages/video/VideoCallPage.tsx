import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const VideoCallPage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [status, setStatus] = useState('Enter a Room ID to join the call');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);

  // Get room from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setRoomId(room);
  }, []);

  const initSocket = () => {
    const token = localStorage.getItem('nexus_token');
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.on('webrtc:user-joined', async ({ socketId }: { socketId: string }) => {
      setStatus('Participant joined. Connecting...');
      remoteSocketIdRef.current = socketId;
      await createOffer(socketId);
    });

    socketRef.current.on('webrtc:offer', async ({ offer, fromSocketId }: any) => {
      remoteSocketIdRef.current = fromSocketId;
      await handleOffer(offer, fromSocketId);
    });

    socketRef.current.on('webrtc:answer', async ({ answer }: any) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus('Connected!');
      setRemoteConnected(true);
    });

    socketRef.current.on('webrtc:ice-candidate', async ({ candidate }: any) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    });

    socketRef.current.on('webrtc:user-left', () => {
      setStatus('Participant left the call.');
      setRemoteConnected(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketIdRef.current) {
        socketRef.current?.emit('webrtc:ice-candidate', {
          roomId,
          candidate: event.candidate,
          toSocketId: remoteSocketIdRef.current
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
        setStatus('Connected!');
      }
    };

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async (toSocketId: string) => {
    const pc = peerConnectionRef.current || createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('webrtc:offer', { roomId, offer, toSocketId });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromSocketId: string) => {
    const pc = peerConnectionRef.current || createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('webrtc:answer', { roomId, answer, toSocketId: fromSocketId });
    setStatus('Answering...');
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return;
    try {
      setStatus('Accessing camera & microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      initSocket();
      createPeerConnection();
      setJoined(true);
      setStatus('Waiting for others to join...');

      const userId = JSON.parse(atob(localStorage.getItem('nexus_token')?.split('.')[1] || 'e30=')).id;
      socketRef.current?.emit('webrtc:join-room', { roomId, userId });
    } catch (err: any) {
      setStatus(`Error: ${err.message}. Please allow camera access.`);
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioOn(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    socketRef.current?.emit('webrtc:leave-room', { roomId, userId: 'me' });
    socketRef.current?.disconnect();
    setJoined(false);
    setRemoteConnected(false);
    setStatus('Call ended. You can close this window.');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-lg">Nexus Video Call</span>
          {roomId && <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Room: {roomId}</span>}
        </div>
        <div className={`text-sm px-3 py-1 rounded-full ${
          remoteConnected ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'
        }`}>
          {status}
        </div>
      </div>

      {!joined ? (
        /* Join Form */
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
            <h2 className="text-xl font-semibold mb-2 text-center">Join Video Call</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Enter the Room ID from your meeting</p>
            <input
              type="text"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              placeholder="nexus-room-abc123..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Join Call
            </button>
          </div>
        </div>
      ) : (
        /* Call View */
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                You {!videoOn && '(camera off)'}
              </div>
              {!videoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <Monitor className="w-12 h-12 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-sm">Waiting for participant...</p>
                  <p className="text-gray-600 text-xs mt-1">Share Room ID: <span className="text-indigo-400">{roomId}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition ${audioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition ${videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              Share Room ID <span className="text-indigo-400">{roomId}</span> with your participant
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;
