import { Link } from "react-router-dom";
import { SourceList } from "@/src/components/story/SourceList";
import { schoolGuide } from "@/src/data/school/schoolGuide";
import { usePageTitle } from "@/src/lib/usePageTitle";

export default function SchoolPage() {
  usePageTitle("学校一页纸");

  return (
    <div className="page page--school">
      <Link to="/story/school" className="back-link print-hide">
        ← 回到第 7 章
      </Link>

      <header className="chapter-head print-hide">
        <div>
          <p className="chapter-head__num">返校沟通</p>
          <h1 className="chapter-head__title">给老师和同学的一页纸</h1>
        </div>
      </header>
      <p className="page-lead print-hide">
        孩子返校前后，同学和老师常不知道该怎么相处。这一页可以打印，也可以转发给学校；具体安排仍以治疗团队的意见为准。
      </p>

      <article className="school-sheet">
        <p className="school-sheet__eyebrow">骨髓小工厂 · 返校沟通页</p>
        <h2 className="school-sheet__title">和白血病同学相处，可以知道这几件事</h2>
        <p className="school-sheet__intro">{schoolGuide.intro}</p>
        <p className="school-sheet__banner">白血病不会传染</p>

        {schoolGuide.audiences.map((audience) => (
          <section key={audience.id} className="school-sheet__section" aria-labelledby={`school-${audience.id}`}>
            <h2 id={`school-${audience.id}`}>{audience.label}</h2>
            <p className="school-sheet__lead">{audience.lead}</p>
            <ul>
              {audience.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="school-sheet__section school-sheet__reminders" aria-labelledby="school-reminders">
          <h2 id="school-reminders">请记得</h2>
          <ul>
            {schoolGuide.reminders.map((reminder) => (
              <li key={reminder}>{reminder}</li>
            ))}
          </ul>
        </section>

        <section className="school-sheet__sources" aria-labelledby="school-sources">
          <h2 id="school-sources">来源</h2>
          <SourceList ids={schoolGuide.sourceIds} />
          <p className="school-sheet__verified">本站核对 {schoolGuide.verifiedAt}</p>
        </section>
      </article>

      <div className="button-row print-hide">
        <button type="button" className="primary-button" onClick={() => window.print()}>
          打印这一页
        </button>
        <Link to="/grown-ups" className="text-button">
          大人看这里
        </Link>
      </div>
    </div>
  );
}