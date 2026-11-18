import { PARENT_SCRIPTS, SEEK_HELP_SIGNS, SEEK_HELP_STEPS } from "@/src/data/feelings/feelings";

export function GrownUpFeelings({ onBack }: { onBack: () => void }) {
  return (
    <section className="grownup-feelings" aria-labelledby="grownup-feelings-title">
      <header className="grownup-feelings__head">
        <p className="chapter-head__num">给大人</p>
        <h2 id="grownup-feelings-title">怎么跟孩子说，什么时候找专业的人</h2>
        <p>不同年龄能听懂的不一样。下面的话可以照着说，也可以改成你家的说法。</p>
      </header>

      <div className="grownup-feelings__grid">
        <section className="grownup-panel" aria-labelledby="grownup-scripts-title">
          <h3 id="grownup-scripts-title">分龄话术</h3>
          <div className="script-grid">
            {PARENT_SCRIPTS.map((script) => (
              <article key={script.title} className="script-card">
                <p className="script-card__age">{script.age}</p>
                <h4>{script.title}</h4>
                <ul>
                  {script.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="grownup-panel__note">
            孩子不知道答案时，可以说「我们一起去问医生」，不用编答案；也不用承诺「没事」「很快就好」。
          </p>
        </section>

        <section className="grownup-panel is-help" id="grownup-help" aria-labelledby="grownup-help-title">
          <h3 id="grownup-help-title">什么时候找专业的人</h3>
          <p className="grownup-panel__lead">
            下面这些情况持续出现时，不要只靠自己扛，联系孩子所在医院的治疗团队。
          </p>
          <ul className="plain-list">
            {SEEK_HELP_SIGNS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h4>怎么找帮助</h4>
          <ol className="plain-list">
            {SEEK_HELP_STEPS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="grownup-panel__note">
            紧急情况按急救流程处理。
          </p>
        </section>
      </div>

      <button type="button" className="text-button grownup-feelings__back" onClick={onBack}>
        ← 回到孩子的工具
      </button>
    </section>
  );
}
