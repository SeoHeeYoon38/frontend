import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import airplane from "../assets/icons/transport-airplane.svg";
import friend from "../assets/icons/nav-profile.svg";
import route from "../assets/icons/status-ai-sparkle.svg";
import pin from "../assets/icons/field-location.svg";
import bell from "../assets/icons/nav-notification.svg";
import emptyBell from "../assets/course-settings/bell.svg";
import calendar from "../assets/icons/calendar-outline.svg";
import back from "../assets/icons/nav-back.svg";
import { mockNotifications } from "../data/mocks/notificationData";
import type {
  NotificationFilter,
  NotificationIcon,
} from "../types/notifications";
import * as S from "./NotificationsPage.styled";

const filters: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "trip", label: "내 여행" },
  { value: "friend", label: "친구" },
  { value: "news", label: "소식" },
];

const groups = ["오늘", "이번 주", "이전"] as const;

const icons: Record<NotificationIcon, string> = {
  airplane,
  friend,
  route,
  pin,
  bell,
  calendar,
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [invitationState, setInvitationState] = useState<
    "pending" | "accepted" | "declined"
  >("pending");

  const visible = useMemo(
    () =>
      filter === "all"
        ? mockNotifications
        : mockNotifications.filter((item) => item.category === filter),
    [filter],
  );
  const hasNotifications = mockNotifications.length > 0;

  return (
    <S.Shell $empty={!hasNotifications}>
      <S.Navigation>
        <button type="button" aria-label="홈으로 돌아가기" onClick={() => navigate(-1)}>
          <img src={back} alt=""  />
        </button>
        <h1>알림</h1>
      </S.Navigation>
      {hasNotifications && (
        <S.Filters aria-label="알림 분류">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </S.Filters>
      )}
      {hasNotifications ? (
        <S.Body>
          {visible.length ? (
            groups.map((group) => {
              const items = visible.filter((item) => item.group === group);
              if (!items.length) return null;
              return (
                <S.Group key={group}>
                  <h2>{group}</h2>
                  {items.map((item) => (
                    <S.Item key={item.id} $unread={Boolean(item.unread)}>
                      <S.Icon>
                        <img src={icons[item.icon]} alt="" />
                      </S.Icon>
                      <S.Text>
                        <S.Meta>
                          <strong>{item.label}</strong>
                          <span>{item.time}</span>
                          {item.unread && <i aria-label="읽지 않음" />}
                        </S.Meta>
                        <p>{item.message}</p>
                        {item.invitation && (
                          <S.InvitationActions>
                            {invitationState === "pending" ? (
                              <>
                                <button type="button" onClick={() => setInvitationState("accepted")}>참여하기</button>
                                <button type="button" onClick={() => setInvitationState("declined")}>거절</button>
                              </>
                            ) : (
                              <span role="status">
                                {invitationState === "accepted" ? "참여했어요" : "초대를 거절했어요"}
                              </span>
                            )}
                          </S.InvitationActions>
                        )}
                      </S.Text>
                      {item.thumbnail && <S.Thumbnail src={item.thumbnail} alt="" />}
                    </S.Item>
                  ))}
                </S.Group>
              );
            })
          ) : (
            <S.Empty>이 분류에는 아직 알림이 없어요.</S.Empty>
          )}
        </S.Body>
      ) : (
        <S.EmptyBody>
          <S.EmptyIcon>
            <img src={emptyBell} alt="" />
          </S.EmptyIcon>
          <h2>아직 받은 알림이 없어요</h2>
          <p>
            여행 일정, 친구 초대, 새로운 코스 소식을
            <br />
            여기에서 알려드릴게요
          </p>
        </S.EmptyBody>
      )}
      <S.HomeIndicator aria-hidden="true" />
    </S.Shell>
  );
}

export default NotificationsPage;
