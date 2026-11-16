import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useAssistant } from "@/src/features/assistant/AssistantContext";
import {
  answerQuestion,
  assistantWelcome,
  type AssistantReply,
} from "@/src/features/assistant/answer";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text?: string;
  reply?: AssistantReply;
};

export function AssistantLauncher() {
  const { isOpen, open } = useAssistant();
  if (isOpen) return null;
  return (
    <button
      id="assistant-launcher"
      type="button"
      className="assistant-launcher"
      onClick={open}
      aria-label="打开 AI 小助手"
    >
      <Sparkles size={20} aria-hidden="true" />
      <span>问小助手</span>
    </button>
  );
}

export function AssistantPanel() {
  const { isOpen, close } = useAssistant();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "assistant", reply: assistantWelcome },
  ]);
  const [draft, setDraft] = useState("");
  const nextIdRef = useRef(1);
  const navigatingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.setTimeout(() => {
        if (navigatingRef.current) {
          navigatingRef.current = false;
          return;
        }
        if (trigger?.isConnected) {
          trigger.focus();
        } else {
          document.getElementById("assistant-launcher")?.focus();
        }
      }, 0);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    if (!list) return;
    if (messages.length === 1) {
      list.scrollTop = 0;
      return;
    }
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [isOpen, messages.length]);

  function ask(question: string) {
    const trimmed = question.trim().slice(0, 500);
    if (!trimmed) return;
    const reply = answerQuestion(trimmed);
    setMessages((current) => [
      ...current,
      { id: nextIdRef.current++, role: "user", text: trimmed },
      { id: nextIdRef.current++, role: "assistant", reply },
    ]);
    setDraft("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft);
  }

  function reset() {
    setMessages([{ id: nextIdRef.current++, role: "assistant", reply: assistantWelcome }]);
    setDraft("");
    inputRef.current?.focus();
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="assistant-backdrop" onClick={close} aria-hidden="true" />
      <section
        ref={panelRef}
        className="assistant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
      >
        <header className="assistant-header">
          <div className="assistant-header__title">
            <span className="assistant-mark" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <span>
              <b id="assistant-title">AI 小助手</b>
              <small>基于站内知识库 · 不联网</small>
            </span>
          </div>
          <div className="assistant-header__actions">
            <button
              type="button"
              className="assistant-icon-button"
              onClick={reset}
              aria-label="清空对话"
              title="清空对话"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="assistant-icon-button"
              onClick={close}
              aria-label="关闭小助手"
              title="关闭"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          className="assistant-log"
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="小助手对话"
        >
          {messages.map((message) =>
            message.role === "user" ? (
              <div className="assistant-msg assistant-msg--user" key={message.id}>
                <p>{message.text}</p>
              </div>
            ) : message.reply ? (
              <div className="assistant-msg assistant-msg--bot" key={message.id}>
                <div className="assistant-bubble">
                  {message.reply.title ? (
                    <p className="assistant-reply-title">{message.reply.title}</p>
                  ) : null}
                  {message.reply.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {message.reply.bullets && message.reply.bullets.length > 0 ? (
                    <ul className="plain-list plain-list--tight">
                      {message.reply.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {message.reply.sections?.map((section) => (
                    <section className="assistant-section" key={section.heading}>
                      <h3 className="assistant-section__title">{section.heading}</h3>
                      {section.paragraphs?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.bullets && section.bullets.length > 0 ? (
                        <ul className="plain-list plain-list--tight">
                          {section.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                  {message.reply.sources.length > 0 ? (
                    <div className="assistant-sources">
                      <span>来源</span>
                      {message.reply.sources.map((source) =>
                        source.url ? (
                          <a
                            key={source.url}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {source.label}
                          </a>
                        ) : (
                          <span key={source.label}>{source.label}</span>
                        ),
                      )}
                    </div>
                  ) : null}
                  {message.reply.actions && message.reply.actions.length > 0 ? (
                    <div className="assistant-actions">
                      {message.reply.actions.map((action) => (
                        <Link
                          key={action.to + action.label}
                          to={action.to}
                          className="btn btn--small btn--ghost"
                          onClick={() => {
                            navigatingRef.current = true;
                            close();
                          }}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {message.reply.suggestions && message.reply.suggestions.length > 0 ? (
                    <div className="assistant-suggestions">
                      {message.reply.suggestions.map((question) => (
                        <button
                          key={question}
                          type="button"
                          className="assistant-suggestion"
                          onClick={() => ask(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null,
          )}
        </div>

        <form className="assistant-composer" onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="assistant-input">
            问小助手
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            className="assistant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(draft);
              }
            }}
            rows={2}
            maxLength={500}
            placeholder="问一个术语、医保入口或票据整理问题…"
          />
          <button
            type="submit"
            className="btn btn--primary assistant-send"
            disabled={!draft.trim()}
          >
            <Send size={17} aria-hidden="true" />
            <span>发送</span>
          </button>
        </form>
        <p className="assistant-footnote">
          只检索站内已核对资料 · 不读取票据和账本 · 不替代医生诊断
        </p>
      </section>
    </>
  );
}
