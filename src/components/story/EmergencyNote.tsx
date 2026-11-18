import { Link } from "react-router-dom";

export function EmergencyNote() {
  return (
    <aside className="emergency-note print-hide" aria-label="紧急情况提醒">
      <div>
        <p className="emergency-note__title">这些情况，马上联系医院</p>
        <p>
          发烧、寒战、出血不止、呼吸困难、剧烈头痛、抽搐或叫不醒，不要等到第二天。请按治疗医院给你的要求联系医院或急救。
        </p>
      </div>
      <Link to="/recovery#emergency" className="text-button">
        看紧急情况提醒
      </Link>
    </aside>
  );
}