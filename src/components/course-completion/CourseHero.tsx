import backIcon from "../../assets/course-completion/back.svg";
import settingsIcon from "../../assets/course-completion/settings.svg";
import chatIcon from "../../assets/course-community/chat.svg";
import inviteIcon from "../../assets/course-completion/invite-plus.svg";
import memberInviteIcon from "../../assets/course-completion/member-invite-plus.svg";
import { communityMembers } from "../../data/mocks/courseCommunityData";
import type { MockTrip } from "../../types/mockTrip";
import { formatTripDateRange } from "../../utils/importedTrip";

interface CourseHeroProps {
  trip: MockTrip;
  onOpenSettings: () => void;
  onOpenChat?: () => void;
  onInvite?: () => void;
  onBack?: () => void;
  variant?: "default" | "ai";
}

function CourseHero({ trip, onOpenSettings, onOpenChat, onInvite, onBack, variant = "default" }: CourseHeroProps) {
  const shared = Boolean(onOpenChat);
  return (
    <header className={`course-hero ${variant === "ai" ? "course-hero--ai" : ""}`}>
      <img
        className="course-hero__photo"
        src={trip.coverImage}
        alt={`${trip.city} 여행`}
      />
      <div className="course-hero__scrim" />
      <nav className="course-navigation" aria-label="코스 화면 탐색">
        <button type="button" aria-label="뒤로 가기" onClick={onBack}>
          <img src={backIcon} alt="" />
        </button>
        <strong>{trip.source === "direct" ? "직접 만든 여행" : shared ? "함께하는 여행" : "AI 여행 코스"}</strong>
        {onOpenChat && (
          <button type="button" aria-label="함께하는 여행 채팅" onClick={onOpenChat}>
            <img src={chatIcon} alt="" />
          </button>
        )}
        <button type="button" aria-label="설정 열기" onClick={onOpenSettings}>
          <img src={settingsIcon} alt="" />
        </button>
      </nav>
      <div className="course-hero__title">
        <span>{trip.city}</span>
        <h1>{trip.title}</h1>
        <p>{formatTripDateRange(trip.startDate, trip.endDate)}</p>
      </div>
      {shared ? <ul className="course-hero__members" aria-label="함께하는 멤버">
        {communityMembers.map((member) => <li key={member.id} title={member.name}>
          <img src={member.avatar} alt={member.name} />
        </li>)}
        {onInvite && <li className="course-hero__member-invite">
          <button type="button" onClick={onInvite} aria-label="친구 초대"><img src={memberInviteIcon} alt="" /></button>
        </li>}
      </ul> : onInvite && <button className="course-hero__invite" type="button" onClick={onInvite}>
        <img src={inviteIcon} alt="" />친구 초대
      </button>}
    </header>
  );
}

export default CourseHero;
