import { Link } from "react-router-dom";

export const BreadcrumbLayout = () => {
  const loc = window.location.pathname.split("/").slice(1);
  return (
    <div className="breadcrumbs text-lg ml-5">
      <ul>
        {loc.map((k, idx) => (
          <li key={k}>
            {idx === 0 ? (
              <Link to="/">Home</Link>
            ) : (
              <Link to={`/${k}`}>{k}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
