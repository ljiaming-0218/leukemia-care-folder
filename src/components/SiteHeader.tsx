import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "首页", end: true },
  { to: "/learn", label: "白血病科普" },
  { to: "/resources", label: "医保和救助" },
  { to: "/stories", label: "同路人" },
  { to: "/fundraising", label: "筹款准备" },
  { to: "/receipts", label: "票据导入" },
  { to: "/ledger", label: "家庭费用" },
  { to: "/prepare", label: "提交准备" },
  { to: "/about", label: "说明" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand" aria-label="儿童白血病就医资料夹，返回首页">
          <span className="brand__mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2h6.5A1.5 1.5 0 0 1 20 9.5v8A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path d="M12 11v5M9.5 13.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <span className="brand__title">儿童白血病就医资料夹</span>
            <span className="brand__sub">术语 · 医保 · 票据 · 材料</span>
          </span>
        </NavLink>
        <nav className="site-nav" aria-label="主要页面">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
