import { useEffect } from "react";

export const SITE_NAME = "骨髓小工厂";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`;
    return () => {
      document.title = `${SITE_NAME} · 讲给孩子听的白血病`;
    };
  }, [title]);
}
