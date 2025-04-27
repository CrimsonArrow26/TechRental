import React from "react";

interface StatsSectionProps {
  statistics: {
    totalComponents: number;
    activeRentals: number;
    students: number;
    satisfactionRate: number;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ statistics }) => (
  <section className="stats-section">
    <div className="stat">
      <h3>Total Components</h3>
      <p>{statistics.totalComponents}</p>
    </div>
    <div className="stat">
      <h3>Active Rentals</h3>
      <p>{statistics.activeRentals}</p>
    </div>
    <div className="stat">
      <h3>Students</h3>
      <p>{statistics.students}</p>
    </div>
    <div className="stat">
      <h3>Satisfaction Rate</h3>
      <p>{statistics.satisfactionRate}%</p>
    </div>
  </section>
);

export default StatsSection;