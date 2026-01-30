import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState({ courses: [], assignments: [] });

  useEffect(() => {
    // Fetches will be implemented here to call your backend
  }, []);

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>
      <div className="dashboard-grid">
        <section className="card">
          <h3>Your Courses</h3>
          <p>No courses to display.</p>
        </section>
        <section className="card">
          <h3>Upcoming Assignments</h3>
          <p>No upcoming assignments.</p>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;