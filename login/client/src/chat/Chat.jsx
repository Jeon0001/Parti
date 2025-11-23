import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import './Chat.css';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [callId, setCallId] = useState('');
  const [joinCallId, setJoinCallId] = useState('');
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [autoJoining, setAutoJoining] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Get username from session
  useEffect(() => {
    fetch('http://localhost:3000/api/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsername(data.data.username);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Auto-join chat room if chatRoomName is provided from navigation
  useEffect(() => {
    const chatRoomName = location.state?.chatRoomName;
    if (chatRoomName && username && !inCall && !autoJoining) {
      setAutoJoining(true);
      // Use the joinCall logic directly here to avoid dependency issues
      const targetCallId = chatRoomName;
      
      navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      }).then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          remoteStreamRef.current = event.streams[0];
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              callId: targetCallId,
              candidate: event.candidate
            });
          }
        };

        socket.emit('join-call', { callId: targetCallId, username });
        setCallId(targetCallId);
        setInCall(true);
        addMessage('system', `Joined chat room: ${targetCallId}`);
        setAutoJoining(false);
      }).catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Error accessing microphone. Please check permissions.');
        setAutoJoining(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, location.state?.chatRoomName, inCall, autoJoining]);

  // Socket event handlers
  useEffect(() => {
    socket.on('user-joined', async (data) => {
      setParticipants(data.participants);
      addMessage('system', `${data.username} joined the call`);
      
      // If we're already in a call and a new user joins, create an offer
      if (peerConnectionRef.current && inCall) {
        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          
          socket.emit('offer', {
            callId,
            offer,
            to: data.socketId
          });
        } catch (error) {
          console.error('Error creating offer for new user:', error);
        }
      }
    });

    socket.on('user-left', (data) => {
      setParticipants(data.participants);
      addMessage('system', `${data.username} left the call`);
    });

    socket.on('offer', async (data) => {
      await handleOffer(data.offer, data.from);
    });

    socket.on('answer', async (data) => {
      await handleAnswer(data.answer);
    });

    socket.on('ice-candidate', async (data) => {
      await handleIceCandidate(data.candidate);
    });

    socket.on('message', (data) => {
      addMessage(data.username, data.message);
    });

    socket.on('existing-participants', async (data) => {
      // When joining, create an offer for existing participants
      if (peerConnectionRef.current && data.participants.length > 0) {
        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          
          // Send offer to all existing participants
          data.participants.forEach(participantId => {
            socket.emit('offer', {
              callId,
              offer,
              to: participantId
            });
          });
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('message');
      socket.off('existing-participants');
    };
  }, [callId, inCall]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (username, message) => {
    setMessages(prev => [...prev, { username, message, timestamp: new Date() }]);
  };

  const generateCallId = () => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const createCall = async () => {
    if (!username) return;
    
    const newCallId = callId || generateCallId();
    setCallId(newCallId);
    
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        remoteStreamRef.current = event.streams[0];
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            callId: newCallId,
            candidate: event.candidate
          });
        }
      };

      // Join the room
      socket.emit('join-call', { callId: newCallId, username });
      setInCall(true);
      addMessage('system', `Call created: ${newCallId}`);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const joinCall = async (roomName = null) => {
    const targetCallId = roomName || joinCallId;
    if (!targetCallId || !username) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        remoteStreamRef.current = event.streams[0];
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            callId: targetCallId,
            candidate: event.candidate
          });
        }
      };

      // Join the room
      socket.emit('join-call', { callId: targetCallId, username });
      setCallId(targetCallId);
      setInCall(true);
      addMessage('system', `Joined call: ${targetCallId}`);
      setAutoJoining(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Error accessing microphone. Please check permissions.');
      setAutoJoining(false);
    }
  };

  const handleOffer = async (offer, from) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit('answer', {
        callId,
        answer,
        to: from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    if (!peerConnectionRef.current) return;
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    if (!peerConnectionRef.current) return;
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket.emit('leave-call', { callId, username });
    setInCall(false);
    setCallId('');
    setJoinCallId('');
    setMessages([]);
    setParticipants([]);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    socket.emit('message', {
      callId,
      username,
      message: messageInput
    });

    addMessage(username, messageInput);
    setMessageInput('');
  };

  if (!username) {
    return <div className="chat-loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Voice & Text Chat</h1>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {!inCall ? (
        <div className="call-setup">
          <div className="setup-section">
            <h2>Create a Call</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter call ID (or leave empty to generate)"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
              />
              <button onClick={createCall}>Create Call</button>
            </div>
          </div>

          <div className="setup-section">
            <h2>Join a Parti Chatroom</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter chatroom ID to join"
                value={joinCallId}
                onChange={(e) => setJoinCallId(e.target.value)}
              />
              <button onClick={() => joinCall()}>Join Chatroom</button>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#9ed6b9', opacity: 0.8 }}>
              Enter the chatroom ID from a parti to join its chat
            </p>
          </div>
        </div>
      ) : (
        <div className="call-active">
          <div className="call-info">
            <h2>Call ID: {callId}</h2>
            <p>Participants: {participants.length}</p>
          </div>

          <div className="call-content">
            <div className="video-section">
              <div className="video-container">
                <div className="video-wrapper">
                  <audio ref={localVideoRef} autoPlay muted />
                  <div className="video-label">You ({username})</div>
                </div>
                <div className="video-wrapper">
                  <audio ref={remoteVideoRef} autoPlay />
                  <div className="video-label">Remote</div>
                </div>
              </div>

              <div className="call-controls">
                <button 
                  className={`control-btn ${isMuted ? 'muted' : ''}`}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                <button 
                  className="control-btn leave-btn"
                  onClick={leaveCall}
                >
                  Leave Call
                </button>
              </div>
            </div>

            <div className="chat-section">
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.username === 'system' ? 'system' : ''}`}>
                    {msg.username !== 'system' && (
                      <span className="message-username">{msg.username}:</span>
                    )}
                    <span className="message-text">{msg.message}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="message-input-form">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="message-input"
                />
                <button type="submit" className="send-btn">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

