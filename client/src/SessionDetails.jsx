// import React, { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import "./SessionDetails.css";

// const sessions = {
//   1: {
//     partner: "Aarav Sharma",
//     skill: "Java & OOP",
//     date: "Today",
//     time: "6:00 PM",
//     type: "Online",
//     avatar: "AS",
//     role: "Java Developer & Mentor",
//     status: "Upcoming",
//     description:
//       "Learn Java fundamentals, OOP concepts and practical programming techniques.",
//   },

//   2: {
//     partner: "Priya Mehta",
//     skill: "UI/UX Design",
//     date: "Tomorrow",
//     time: "5:30 PM",
//     type: "Online",
//     avatar: "PM",
//     role: "UI/UX Designer & Mentor",
//     status: "Upcoming",
//     description:
//       "Improve your UI/UX design skills through practical design discussions.",
//   },

//   3: {
//     partner: "Rohan Verma",
//     skill: "Python & SQL",
//     date: "18 Sep 2026",
//     time: "7:00 PM",
//     type: "Online",
//     avatar: "RV",
//     role: "Python Developer & Mentor",
//     status: "Completed",
//     description:
//       "Practice Python, SQL and backend development concepts.",
//   },
// };

// function SessionDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const session = sessions[id];

//   const [sessionStatus, setSessionStatus] = useState(
//     session?.status || "Upcoming"
//   );

//   const [showReschedule, setShowReschedule] = useState(false);
//   const [showFeedback, setShowFeedback] = useState(false);
//   const [feedback, setFeedback] = useState("");

//   if (!session) {
//     return (
//       <div className="session-details-page">
//         <div className="session-details-card">
//           <h1>Session Not Found</h1>

//           <button onClick={() => navigate("/sessions")}>
//             Back to Sessions
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handleJoin = () => {
//     alert(`Joining ${session.partner}'s ${session.skill} session`);
//   };

//   const handleCancel = () => {
//     const confirmCancel = window.confirm(
//       "Are you sure you want to cancel this session?"
//     );

//     if (confirmCancel) {
//       setSessionStatus("Cancelled");
//       alert("Session cancelled successfully.");
//     }
//   };

//   const handleReschedule = () => {
//     setShowReschedule(false);
//     alert("Session reschedule request sent successfully.");
//   };

//   const handleFeedback = () => {
//     if (!feedback.trim()) {
//       alert("Please enter your feedback.");
//       return;
//     }

//     alert("Thank you for your feedback!");
//     setFeedback("");
//     setShowFeedback(false);
//   };

//   return (
//     <div className="session-details-page">

//       <button
//         className="back-button"
//         onClick={() => navigate("/sessions")}
//       >
//         ← Back to Sessions
//       </button>

//       <div className="session-details-card">

//         {/* Avatar */}
//         <div className="details-avatar">
//           {session.avatar}
//         </div>

//         {/* Status */}
//         <span
//           className={`details-badge ${sessionStatus.toLowerCase()}`}
//         >
//           {sessionStatus}
//         </span>

//         {/* Main Details */}
//         <h1>{session.skill}</h1>

//         <h2>{session.partner}</h2>

//         <p className="partner-role">
//           {session.role}
//         </p>

//         <p className="session-description">
//           {session.description}
//         </p>

//         {/* Information */}
//         <div className="details-info">

//           <div>
//             <strong>📅 Date</strong>
//             <span>{session.date}</span>
//           </div>

//           <div>
//             <strong>🕒 Time</strong>
//             <span>{session.time}</span>
//           </div>

//           <div>
//             <strong>💻 Session Type</strong>
//             <span>{session.type}</span>
//           </div>

//           <div>
//             <strong>🎯 Skill</strong>
//             <span>{session.skill}</span>
//           </div>

//         </div>

//         {/* Upcoming Actions */}
//         {sessionStatus === "Upcoming" && (
//           <div className="session-actions">

//             <button
//               className="join-button"
//               onClick={handleJoin}
//             >
//               Join Session
//             </button>

//             <button
//               className="reschedule-button"
//               onClick={() => setShowReschedule(true)}
//             >
//               Reschedule
//             </button>

//             <button
//               className="cancel-button"
//               onClick={handleCancel}
//             >
//               Cancel Session
//             </button>

//           </div>
//         )}

//         {/* Completed Actions */}
//         {sessionStatus === "Completed" && (
//           <div className="session-actions">

//             <button
//               className="feedback-button"
//               onClick={() => setShowFeedback(true)}
//             >
//               Give Feedback
//             </button>

//           </div>
//         )}

//         {/* Cancelled */}
//         {sessionStatus === "Cancelled" && (
//           <div className="cancelled-message">
//             This session has been cancelled.
//           </div>
//         )}

//       </div>

//       {/* Reschedule Box */}
//       {showReschedule && (
//         <div className="popup-box">

//           <h2>Reschedule Session</h2>

//           <label>Select New Date</label>

//           <input type="date" />

//           <label>Select New Time</label>

//           <input type="time" />

//           <div className="popup-actions">

//             <button
//               className="join-button"
//               onClick={handleReschedule}
//             >
//               Confirm
//             </button>

//             <button
//               className="cancel-button"
//               onClick={() => setShowReschedule(false)}
//             >
//               Close
//             </button>

//           </div>

//         </div>
//       )}

//       {/* Feedback Box */}
//       {showFeedback && (
//         <div className="popup-box">

//           <h2>Session Feedback</h2>

//           <textarea
//             placeholder="Write your feedback..."
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//           />

//           <div className="popup-actions">

//             <button
//               className="feedback-button"
//               onClick={handleFeedback}
//             >
//               Submit Feedback
//             </button>

//             <button
//               className="cancel-button"
//               onClick={() => setShowFeedback(false)}
//             >
//               Close
//             </button>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

// export default SessionDetails;
import React, { useState, useEffect } from 'react';

const SessionDetails = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Database se sessions fetch karna
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sessions', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(data.message || 'Sessions fetch nahi ho paye');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Session Cancel action handle karna
  const handleCancelSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();
      if (data.success) {
        fetchSessions(); // UI refresh
      } else {
        alert(data.message || 'Could not cancel session');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading sessions from database...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Learning Sessions</h2>
      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          {sessions.map((session) => (
            <div 
              key={session._id} 
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1a73e8' }}>{session.skill}</h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: session.status === 'upcoming' ? '#e6f4ea' : '#fce8e6',
                  color: session.status === 'upcoming' ? '#137333' : '#c5221f'
                }}>
                  {session.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '4px 0' }}><strong>Learner:</strong> {session.learner?.name || 'N/A'}</p>
              <p style={{ margin: '4px 0' }}><strong>Time:</strong> {new Date(session.scheduledAt).toLocaleString()}</p>
              <p style={{ margin: '4px 0' }}><strong>Duration:</strong> {session.durationMinutes} mins</p>
              {session.meetingLink && (
                <p style={{ margin: '4px 0' }}>
                  <a href={session.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#1a73e8' }}>
                    Join Meeting Link
                  </a>
                </p>
              )}
              {session.status === 'upcoming' && (
                <button
                  onClick={() => handleCancelSession(session._id)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#d93025',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Session
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionDetails;