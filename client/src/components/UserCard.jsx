function UserCard({ name, skillsOffered, skillsWanted }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>

      <p>
        <strong>Can Teach:</strong>{" "}
        {skillsOffered.join(", ")}
      </p>

      <p>
        <strong>Wants to Learn:</strong>{" "}
        {skillsWanted.join(", ")}
      </p>

      <button>View Profile</button>
    </div>
  );
}

export default UserCard;