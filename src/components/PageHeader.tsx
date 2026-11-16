import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div className="page-head__main">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="page-head__aside">
        <p className="lead">{lead}</p>
        {children}
      </div>
    </div>
  );
}
