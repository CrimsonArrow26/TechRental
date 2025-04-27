import React from "react";

interface StatsSectionProps {
  statistics: {
    totalComponents: number;
    activeRentals: number;
    students: number;
    satisfactionRate: number;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ statistics }) => {
  // Validate statistics data
  if (!statistics) {
    return <div role="alert">No statistics data available</div>;
  }

  return (
    <section className="stats-section" aria-label="Statistics Overview">
      <div className="stat" role="group" aria-label="Total Components">
        <h3>Total Components</h3>
        <p className="stat-value">{statistics.totalComponents.toLocaleString()}</p>
      </div>
      <div className="stat" role="group" aria-label="Active Rentals">
        <h3>Active Rentals</h3>
        <p className="stat-value">{statistics.activeRentals.toLocaleString()}</p>
      </div>
      <div className="stat" role="group" aria-label="Students">
        <h3>Students</h3>
        <p className="stat-value">{statistics.students.toLocaleString()}</p>
      </div>
      <div className="stat" role="group" aria-label="Satisfaction Rate">
        <h3>Satisfaction Rate</h3>
        <p className="stat-value">{statistics.satisfactionRate}%</p>
      </div>
      <style jsx>{`
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          padding: 2rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .stat {
          text-align: center;
          padding: 1.5rem;
          background-color: white;
          border-radius: 6px;
          transition: transform 0.2s ease;
        }
        .stat:hover {
          transform: translateY(-5px);
        }
        .stat h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.1rem;
        }
        .stat-value {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }
      `}</style>
    </section>
  );
};

export default StatsSection;