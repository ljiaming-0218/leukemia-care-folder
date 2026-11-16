import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { knowledgeCards, knowledgeTopics } from "@/src/data/knowledge/cards";
import {
  glossaryEntries,
  glossaryGroups,
} from "@/src/data/knowledge/glossary";
import type { GlossaryGroup, KnowledgeTopic } from "@/src/domain/schemas";
import { KnowledgeCardView } from "@/src/components/KnowledgeCardView";
import { KnowledgeGraph } from "@/src/components/KnowledgeGraph";
import { PageHeader } from "@/src/components/PageHeader";
import { scrollToElement } from "@/src/lib/scrollToElement";
import { usePageTitle } from "@/src/lib/usePageTitle";

type LearnView = "graph" | "cards" | "terms";

export default function LearnPage() {
  usePageTitle("白血病科普");

  const location = useLocation();
  const [view, setView] = useState<LearnView>("graph");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<KnowledgeTopic | "全部">("全部");
  const [termQuery, setTermQuery] = useState("");
  const [termGroup, setTermGroup] = useState<GlossaryGroup | "全部">("全部");
  const [pendingTarget, setPendingTarget] = useState("");

  const hash = location.hash.slice(1);

  useEffect(() => {
    if (!hash) {
      setView("graph");
      return;
    }
    if (hash.startsWith("term-") || hash === "glossary") {
      setView("terms");
      if (hash.startsWith("term-")) {
        setTermQuery("");
        setTermGroup("全部");
      }
    } else {
      setView("cards");
      setQuery("");
      setTopic("全部");
    }
    setPendingTarget(hash);
  }, [hash]);

  useEffect(() => {
    if (!pendingTarget) return;
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const target = document.getElementById(pendingTarget);
      if (target) {
        if (target instanceof HTMLDetailsElement) target.open = true;
        scrollToElement(target);
        setPendingTarget("");
        return;
      }
      if (attempts < 12) {
        attempts += 1;
        frame = window.requestAnimationFrame(tryScroll);
      } else {
        setPendingTarget("");
      }
    };
    frame = window.requestAnimationFrame(tryScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [pendingTarget, view]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return knowledgeCards.filter((card) => {
      if (topic !== "全部" && card.topic !== topic) return false;
      if (!keyword) return true;
      const haystack = [
        card.title,
        card.summary,
        card.applicability,
        card.sourceName,
        ...card.details.flatMap((detail) => [
          detail.heading,
          ...detail.paragraphs,
          ...detail.bullets,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [query, topic]);

  const filteredTerms = useMemo(() => {
    const keyword = termQuery.trim().toLowerCase();
    return glossaryEntries.filter((entry) => {
      if (termGroup !== "全部" && entry.group !== termGroup) return false;
      if (!keyword) return true;
      const haystack = [
        entry.term,
        ...entry.aka,
        entry.plain,
        entry.detail ?? "",
        entry.caution ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [termQuery, termGroup]);

  const groups = knowledgeTopics
    .map((groupTopic) => ({
      topic: groupTopic,
      cards: filtered.filter((card) => card.topic === groupTopic),
    }))
    .filter((group) => group.cards.length > 0);

  const termGroups = glossaryGroups
    .map((group) => ({
      group,
      terms: filteredTerms.filter((entry) => entry.group === group),
    }))
    .filter((group) => group.terms.length > 0);

  const views: { id: LearnView; label: string; meta: string }[] = [
    { id: "graph", label: "知识图谱", meta: "31 个概念" },
    { id: "cards", label: "主题卡", meta: `${knowledgeCards.length} 张` },
    { id: "terms", label: "术语表", meta: `${glossaryEntries.length} 条` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="白血病科普"
        title="先弄懂，再去问"
        lead="先用知识图谱看清分型、检查、治疗和费用之间的关系，再按当前处境读主题卡；需要查报告上的词时，进术语表找白话解释和出处。科普不替代医生诊断。"
      />

      <div className="view-switch" role="group" aria-label="选择科普浏览方式">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            className="view-switch__button"
            aria-pressed={view === item.id}
            onClick={() => setView(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.meta}</small>
          </button>
        ))}
      </div>

      {view === "graph" ? (
        <>
          <KnowledgeGraph />
          <p className="notice">
            连线表示概念之间的阅读关系，用来帮助理解报告和就诊流程，不代表诊断结论、治疗顺序或因果。具体判断以医生和官方原文为准。
          </p>
        </>
      ) : null}

      {view === "cards" ? (
        <section aria-labelledby="cards-title">
          <div className="section__head section__head--tight">
            <div>
              <h2 className="section__title" id="cards-title">
                按处境读主题卡
              </h2>
              <p className="section__note">
                七张卡各回答一个家长会遇到的问题，每张含分层解释、行动清单和出处。
              </p>
            </div>
            <p className="section__note">共 {knowledgeCards.length} 张</p>
          </div>

          <div className="filter-panel">
            <div className="field">
              <label className="field__label" htmlFor="learn-search">
                按关键词筛选
              </label>
              <input
                id="learn-search"
                className="input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：基因检测、结算单、异地就医"
                autoComplete="off"
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <span className="field__label" id="topic-label">
                按阶段筛选
              </span>
              <div className="chip-group" role="group" aria-labelledby="topic-label">
                <button
                  type="button"
                  className="chip"
                  aria-pressed={topic === "全部"}
                  onClick={() => setTopic("全部")}
                >
                  全部
                  <span className="chip__count">{knowledgeCards.length}</span>
                </button>
                {knowledgeTopics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    aria-pressed={topic === item}
                    onClick={() => setTopic(item)}
                  >
                    {item}
                    <span className="chip__count">
                      {knowledgeCards.filter((card) => card.topic === item).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="result-bar">
            <p className="result-bar__count" aria-live="polite">
              命中 {filtered.length} 张卡片
            </p>
            <p className="result-bar__meta">
              共收录 {knowledgeCards.length} 张 · 每张含分层解释与出处 · 有疑问的内容会标注「待核对」
            </p>
          </div>

          {groups.length === 0 ? (
            <div className="card">
              <p className="card__body">
                没有找到匹配的内容。试试更短的关键词，或把筛选项切回「全部」。
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section
                className="section section--grouped"
                key={group.topic}
                aria-labelledby={`group-${group.topic}`}
              >
                <div className="section__head">
                  <h3 className="section__title" id={`group-${group.topic}`}>
                    {group.topic}
                  </h3>
                  <p className="section__note">{group.cards.length} 张卡片</p>
                </div>
                {group.cards.map((card) => (
                  <KnowledgeCardView key={card.id} card={card} />
                ))}
              </section>
            ))
          )}
        </section>
      ) : null}

      {view === "terms" ? (
        <section id="glossary" aria-labelledby="glossary-title">
          <div className="section__head section__head--tight">
            <div>
              <h2 className="section__title" id="glossary-title">
                术语表
              </h2>
              <p className="section__note">
                报告、医嘱和费用单上出现的词，先在这里找到白话解释；解释不代替医生判断。
              </p>
            </div>
            <p className="section__note">共 {glossaryEntries.length} 条</p>
          </div>

          <div className="filter-panel">
            <div className="field">
              <label className="field__label" htmlFor="term-search">
                搜索术语
              </label>
              <input
                id="term-search"
                className="input"
                type="search"
                value={termQuery}
                onChange={(event) => setTermQuery(event.target.value)}
                placeholder="例如：MRD、腰穿、起付线、票号"
                autoComplete="off"
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <span className="field__label" id="term-group-label">
                按类别筛选
              </span>
              <div className="chip-group" role="group" aria-labelledby="term-group-label">
                <button
                  type="button"
                  className="chip"
                  aria-pressed={termGroup === "全部"}
                  onClick={() => setTermGroup("全部")}
                >
                  全部
                  <span className="chip__count">{glossaryEntries.length}</span>
                </button>
                {glossaryGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    className="chip"
                    aria-pressed={termGroup === group}
                    onClick={() => setTermGroup(group)}
                  >
                    {group}
                    <span className="chip__count">
                      {glossaryEntries.filter((entry) => entry.group === group).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="result-bar">
            <p className="result-bar__count" aria-live="polite">
              命中 {filteredTerms.length} 条术语
            </p>
            <p className="result-bar__meta">点开每条看白话解释、容易混淆的地方和来源</p>
          </div>

          {termGroups.length === 0 ? (
            <div className="card">
              <p className="card__body">
                没有找到匹配的术语。试试更短的关键词，或把类别切回「全部」。
              </p>
            </div>
          ) : (
            termGroups.map((group) => (
              <div className="term-group" key={group.group}>
                <h3 className="term-group__title">
                  {group.group}
                  <span>{group.terms.length} 条</span>
                </h3>
                {group.terms.map((entry) => (
                  <details className="term" id={`term-${entry.id}`} key={entry.id}>
                    <summary className="term__summary">
                      <span className="term__name">{entry.term}</span>
                      {entry.aka.length > 0 ? (
                        <span className="term__aka">{entry.aka.join(" / ")}</span>
                      ) : null}
                    </summary>
                    <div className="term__body">
                      <p>{entry.plain}</p>
                      {entry.detail ? <p>{entry.detail}</p> : null}
                      {entry.caution ? (
                        <p className="term__caution">{entry.caution}</p>
                      ) : null}
                      <p className="term__source">
                        来源：
                        {entry.sourceUrl ? (
                          <a href={entry.sourceUrl} target="_blank" rel="noreferrer noopener">
                            {entry.sourceName}
                          </a>
                        ) : (
                          entry.sourceName
                        )}
                        <span> · 本站核对 {entry.verifiedAt}</span>
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            ))
          )}
        </section>
      ) : null}
    </>
  );
}
