import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" style={{ textDecoration: "none" }} aria-label="Weekly Pulls Home">
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 0.5,
          background: "linear-gradient(90deg,#1677ff 0%,#722ed1 100%)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          display: "inline-block",
        }}
      >
        WeeklyPulls
      </span>
    </Link>
  );
}
