export function SourceLine({
  name,
  url,
  extraLinks = [],
  publishedAt,
  verifiedAt,
  note,
}: {
  name: string;
  url: string;
  extraLinks?: { label: string; url: string }[];
  publishedAt?: string;
  verifiedAt: string;
  note?: string;
}) {
  return (
    <div className="source-line">
      <span>
        来源：
        <a href={url} target="_blank" rel="noreferrer noopener">
          {name}
        </a>
      </span>
      {publishedAt ? <span>来源发布 {publishedAt}</span> : null}
      {note ? <span>{note}</span> : null}
      <span>本站核对 {verifiedAt}</span>
      <a href={url} target="_blank" rel="noreferrer noopener">
        打开官方原文
      </a>
      {extraLinks.length > 0 ? (
        <span className="source-line__extra">
          延伸阅读：
          {extraLinks.map((link, index) => (
            <span key={link.url}>
              {index > 0 ? " · " : null}
              <a href={link.url} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}
