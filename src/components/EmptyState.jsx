import { Link } from "react-router-dom";

export default function EmptyState({ title, subtitle, linkTo = "/add", linkLabel = "Add Transaction" }) {
  return (
    <div className="empty-state">
      <svg className="empty-state__icon" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M3 9h14a2 2 0 0 1 2 2v1h-4a2 2 0 0 0 0 4h4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
        <circle cx="16" cy="13" r="0.6" fill="currentColor" />
      </svg>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__subtitle">{subtitle}</p>
      <Link to={linkTo} className="empty-state__btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {linkLabel}
      </Link>
    </div>
  );
}
