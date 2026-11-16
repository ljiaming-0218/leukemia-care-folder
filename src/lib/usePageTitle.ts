import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · 儿童白血病就医资料夹`;
    return () => {
      document.title = "儿童白血病就医资料夹";
    };
  }, [title]);
}
