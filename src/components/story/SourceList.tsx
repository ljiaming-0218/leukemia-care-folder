import { getSource, type SourceId } from "@/src/data/story/sources";

export function SourceList({ ids }: { ids: SourceId[] }) {
  return (
    <ul className="source-list">
      {ids.map((id) => {
        const source = getSource(id);
        return (
          <li key={id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>
            <span className="source-list__meta">
              {source.publisher} · {source.reviewedText} · 本站核对 {source.verifiedAt}
            </span>
            {source.note && <span className="source-list__note">{source.note}</span>}
          </li>
        );
      })}
    </ul>
  );
}
