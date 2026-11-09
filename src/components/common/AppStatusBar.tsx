import statusIcons from "../../assets/course-completion/status-icons.svg";
import * as S from "./AppStatusBar.styled";

interface AppStatusBarProps {
  overlay?: boolean;
  tone?: "dark" | "light";
}

function AppStatusBar({ overlay = false, tone = "dark" }: AppStatusBarProps) {
  return (
    <S.Bar $overlay={overlay} $tone={tone} aria-hidden="true">
      <span>9:41</span>
      <img src={statusIcons} alt="" />
    </S.Bar>
  );
}

export default AppStatusBar;
