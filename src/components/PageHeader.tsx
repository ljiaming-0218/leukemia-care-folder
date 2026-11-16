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
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="lead">{lead}</p>
      {children}
    </div>
  );
}
