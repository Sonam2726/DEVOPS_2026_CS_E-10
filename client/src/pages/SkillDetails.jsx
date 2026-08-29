import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./SkillDetails.css";

function SkillDetails() {
    const [requestSent, setRequestSent] = useState(false);

    const handleRequest = () => {
        setRequestSent(true);
    };

    return (
        <div className="skill-details-page">

            {/* ================= HEADER ================= */}

            <div className="skill-header">

                <div className="skill-icon">
                    💻
                </div>

                <div className="skill-title">

                    <span className="skill-category">
                        Programming
                    </span>

                    <h1>Java Programming</h1>

                    <p>
                        Learn Java programming from basics to advanced
                        concepts with practical examples and projects.
                    </p>

                </div>

            </div>


            {/* ================= MAIN CONTENT ================= */}

            <div className="skill-content">

                {/* ================= LEFT SIDE ================= */}

                <div className="left-section">

                    {/* ---------- SKILL OVERVIEW ---------- */}

                    <div className="skill-card">

                        <h2>Skill Overview</h2>

                        <p>
                            Java is a powerful object-oriented programming
                            language widely used for web development,
                            mobile applications, enterprise software
                            and backend systems.
                        </p>

                        <p>
                            In this skill exchange, you can learn Java
                            concepts through practical examples and
                            hands-on coding.
                        </p>

                        <div className="skill-info">

                            <div className="info-item">
                                <span>📊</span>

                                <div>
                                    <small>Skill Level</small>
                                    <strong>Intermediate</strong>
                                </div>
                            </div>

                            <div className="info-item">
                                <span>⏱️</span>

                                <div>
                                    <small>Duration</small>
                                    <strong>4 - 6 Weeks</strong>
                                </div>
                            </div>

                            <div className="info-item">
                                <span>👥</span>

                                <div>
                                    <small>Learners</small>
                                    <strong>24 Learners</strong>
                                </div>
                            </div>

                        </div>

                    </div>


                    {/* ================= AVAILABILITY ================= */}

                    <div className="skill-card">

                        <h2>Availability</h2>

                        <div className="available">
                            <span></span>
                            Available
                        </div>

                        <div className="availability-list">

                            <div className="availability-item">
                                <strong>Monday</strong>
                                <span>6:00 PM - 8:00 PM</span>
                            </div>

                            <div className="availability-item">
                                <strong>Wednesday</strong>
                                <span>6:00 PM - 8:00 PM</span>
                            </div>

                            <div className="availability-item">
                                <strong>Saturday</strong>
                                <span>10:00 AM - 1:00 PM</span>
                            </div>

                        </div>

                    </div>


                    {/* ================= SKILL LEVEL ================= */}

                    <div className="skill-card">

                        <h2>Skill Level</h2>

                        <div className="levels">

                            <div className="level">
                                <div className="level-circle">
                                    1
                                </div>

                                <p>Beginner</p>
                            </div>

                            <div className="level active">
                                <div className="level-circle">
                                    2
                                </div>

                                <p>Intermediate</p>
                            </div>

                            <div className="level">
                                <div className="level-circle">
                                    3
                                </div>

                                <p>Advanced</p>
                            </div>

                        </div>

                    </div>


                    {/* ================= RELATED SKILLS ================= */}

                    <div className="skill-card">

                        <h2>Related Skills</h2>

                        <div className="related-skills">

                            <button>C++</button>
                            <button>Python</button>
                            <button>JavaScript</button>
                            <button>Data Structures</button>

                        </div>

                    </div>


                    {/* ================= WHAT YOU WILL LEARN ================= */}

                    <div className="skill-card">

                        <h2>What You Will Learn</h2>

                        <div className="learning-list">

                            <p>✓ Java fundamentals and syntax</p>
                            <p>✓ Object-Oriented Programming</p>
                            <p>✓ Collections and Exception Handling</p>
                            <p>✓ File Handling</p>
                            <p>✓ Practical Java Projects</p>

                        </div>

                    </div>


                    {/* ================= TEACHER ================= */}

                    <div className="skill-card">

                        <h2>About the Teacher</h2>

                        <div className="teacher">

                            <div className="teacher-avatar">
                                R
                            </div>

                            <div>

                                <h3>Rajneesh Sharma</h3>

                                <p>
                                    Java Developer & Mentor
                                </p>

                                <div className="rating">
                                    ⭐ 4.8
                                    <span>(18 reviews)</span>
                                </div>

                            </div>

                        </div>

                        <p className="teacher-description">
                            Experienced Java developer passionate about
                            helping students understand programming concepts
                            through practical examples and real-world projects.
                        </p>

                    </div>

                </div>


                {/* ================= RIGHT SIDE ================= */}

                <div className="right-section">

                    {/* ---------- REQUEST CARD ---------- */}

                    <div className="request-card">

                        {!requestSent ? (
                            <>
                                <h2>
                                    Want to Learn This Skill?
                                </h2>

                                <p>
                                    Send a learning request to the teacher
                                    and start your skill exchange journey.
                                </p>

                                <button onClick={handleRequest}>
                                    Request to Learn
                                </button>

                                <small>
                                    🔒 Your request will be visible to the teacher
                                </small>
                            </>
                        ) : (
                            <>
                                <div className="request-success-icon">
                                    ✓
                                </div>

                                <h2>
                                    Request Sent
                                </h2>

                                <p>
                                    Your learning request has been sent
                                    successfully. The teacher will be
                                    notified about your request.
                                </p>

                                <button
                                    className="request-sent-button"
                                    disabled
                                >
                                    ✓ Request Sent
                                </button>

                                <small>
                                    🔔 You will receive a notification when
                                    the teacher responds.
                                </small>
                            </>
                        )}

                    </div>


                    {/* ---------- QUICK INFORMATION ---------- */}

                    <div className="skill-card quick-info">

                        <h2>Quick Information</h2>

                        <div>
                            <span>📚 Category</span>
                            <strong>Programming</strong>
                        </div>

                        <div>
                            <span>📈 Level</span>
                            <strong>Intermediate</strong>
                        </div>

                        <div>
                            <span>🕐 Availability</span>
                            <strong>Weekends</strong>
                        </div>

                        <div>
                            <span>💻 Mode</span>
                            <strong>Online</strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default SkillDetails;