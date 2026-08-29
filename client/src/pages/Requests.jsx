import { useState } from "react";
import { Link } from "react-router-dom";
import "./Requests.css";

function Requests() {
  const [filter, setFilter] = useState("All");

  const requests = [
    {
      id: 1,
      skill: "React Development",
      teacher: "Aarav",
      category: "Programming",
      date: "23 Aug 2026",
      status: "Pending",
    },
    {
      id: 2,
      skill: "UI/UX Design",
      teacher: "Karan",
      category: "Design",
      date: "21 Aug 2026",
      status: "Accepted",
    },
    {
      id: 3,
      skill: "Python Programming",
      teacher: "Riya",
      category: "Programming",
      date: "18 Aug 2026",
      status: "Rejected",
    },
    {
      id: 4,
      skill: "Machine Learning",
      teacher: "Ananya",
      category: "Data Science",
      date: "15 Aug 2026",
      status: "Pending",
    },
  ];

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter(
          (request) => request.status === filter
        );

  return (
    <main className="requests-page">

      {/* Header */}
      <section className="requests-header">
        <p>MY ACTIVITY</p>

        <h1>My Learning Requests</h1>

        <span>
          Track the skills you have requested to learn.
        </span>
      </section>


      {/* Filter */}
      <section className="requests-container">

        <div className="request-filters">

          {["All", "Pending", "Accepted", "Rejected"].map(
            (item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "request-filter active"
                    : "request-filter"
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            )
          )}

        </div>


        {/* Requests */}
        <div className="requests-list">

          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                className="request-card"
                key={request.id}
              >

                <div className="request-icon">
                  {request.skill.charAt(0)}
                </div>


                <div className="request-info">

                  <h3>{request.skill}</h3>

                  <p>
                    Teacher:{" "}
                    <strong>{request.teacher}</strong>
                  </p>

                  <div className="request-meta">
                    <span>{request.category}</span>
                    <span>{request.date}</span>
                  </div>

                </div>


                <div className="request-status">

                  <span
                    className={`status ${request.status.toLowerCase()}`}
                  >
                    {request.status}
                  </span>

                </div>

              </div>
            ))
          ) : (
            <div className="empty-requests">

              <h2>No Requests Found</h2>

              <p>
                You don't have any {filter.toLowerCase()}{" "}
                requests.
              </p>

              <Link
                to="/search"
                className="explore-button"
              >
                Explore Skills
              </Link>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Requests;