import React from "react";
import { CalendarDays } from "lucide-react";

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="date-chip">
        <CalendarDays size={17} />
        {new Date().toLocaleDateString("en-KE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
}