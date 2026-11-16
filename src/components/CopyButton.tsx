import { useEffect, useRef, useState, type ReactNode } from "react";
import { copyText } from "@/src/lib/clipboard";

export function CopyButton({ text, children }: { text: string; children: ReactNode }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleClick() {
    const copied = await copyText(text);
    setStatus(copied ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <div>
      <button type="button" className="btn btn--primary" onClick={handleClick}>
        {children}
      </button>
      <p className="copy-feedback" role="status" aria-live="polite">
        {status === "copied"
          ? "已复制，可以粘贴到聊天或备忘录。"
          : status === "failed"
            ? "复制没有成功，请长按选中文字后手动复制。"
            : ""}
      </p>
    </div>
  );
}
