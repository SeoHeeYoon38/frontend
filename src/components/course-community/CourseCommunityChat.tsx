import backIcon from "../../assets/course-settings/back.svg";
import statusIcons from "../../assets/course-completion/status-icons.svg";
import {
  aiAvatar,
  communityDays,
  communityMembers,
} from "../../data/mocks/courseCommunityData";
import useCourseCommunity from "../../hooks/useCourseCommunity";

interface CourseCommunityChatProps {
  onBack: () => void;
  onViewCourse: () => void;
}

function AiAvatar() {
  return <img className="community-chat__ai-avatar" src={aiAvatar} alt="도틀로 AI" />;
}

function CourseCommunityChat({ onBack, onViewCourse }: CourseCommunityChatProps) {
  const {
    message,
    pollOptions,
    selectedDay,
    selectedPollId,
    sentMessages,
    stage,
    applyToCourse,
    openDayPicker,
    setMessage,
    setSelectedDay,
    setSelectedPollId,
    setStage,
    showPoll,
    showSummary,
    submitMessage,
  } = useCourseCommunity();

  const showConversation = stage !== "welcome";
  const showSummaryCard = stage === "summary";
  const showPollCard = ["poll", "day-picker"].includes(stage);

  return (
    <main className="community-chat">
      <div className="community-chat__statusbar" aria-hidden="true">
        <span>9:41</span>
        <img src={statusIcons} alt="" />
      </div>

      <header className="community-chat__header">
        <button type="button" aria-label="코스로 돌아가기" onClick={onBack}>
          <img src={backIcon} alt="" />
        </button>
        <div>
          <h1>오사카 3박 4일</h1>
          <p>함께하는 3명</p>
        </div>
        <ul aria-label="함께하는 멤버">
          {communityMembers.map((member) => (
            <li key={member.id} title={member.name}>
              <img src={member.avatar} alt={member.name} />
            </li>
          ))}
        </ul>
      </header>

      <section className="community-chat__messages" aria-live="polite">
        {stage === "welcome" && (
          <>
            <p className="community-chat__system">정다은님, 이지우님이 여행에 참여했어요</p>
            <article className="community-chat__ai-message">
              <AiAvatar />
              <div>
                <strong>도틀로 AI</strong>
                <div className="community-chat__ai-bubble">
                  <p>안녕하세요! 도틀로 AI예요.</p>
                  <p>
                    함께 여행을 준비하며 의견을 나누고 일정을 조율하는 공간이에요.
                    필요할 때 @도틀로로 불러주세요.
                  </p>
                </div>
                <p className="community-chat__prompt">어떤 이야기부터 나눠볼까요?</p>
                <div className="community-chat__options">
                  <button type="button" onClick={showSummary}>가고 싶은 장소 정하기</button>
                  <button type="button" onClick={showSummary}>일정 함께 조율하기</button>
                  <button type="button" onClick={showSummary}>서로 다른 의견 조율하기</button>
                </div>
              </div>
            </article>
          </>
        )}

        {showConversation && (
          <>
            {showSummaryCard && (
              <>
                <div className="community-chat__member-message">
                  <img src={communityMembers[1].avatar} alt="" />
                  <div><strong>정다은</strong><p>2일차에 유니버설 스튜디오 가고 싶어!</p></div>
                </div>
                <div className="community-chat__member-message">
                  <img src={communityMembers[2].avatar} alt="" />
                  <div><strong>이지우</strong><p>입장료가 좀 부담돼서 다른 곳도 보고 싶어</p></div>
                </div>
                <p className="community-chat__my-message"><b>@도틀로</b> 의견 조율해줘</p>
                <article className="community-chat__ai-message">
                  <AiAvatar />
                  <div>
                    <strong>도틀로 AI</strong>
                    <div className="community-chat__ai-bubble community-chat__ai-bubble--summary">
                      <p>두 분의 의견을 정리했어요.</p>
                      <ul>
                        <li><b>정다은</b> 유니버설 스튜디오에 가고 싶어요</li>
                        <li><b>이지우</b> 비용 부담이 적은 곳을 원해요</li>
                      </ul>
                    </div>
                    <p className="community-chat__prompt">어떤 방향으로 조율해 볼까요?</p>
                    <div className="community-chat__options">
                      <button type="button" onClick={showPoll}>비용이 적은 대체 장소 찾기</button>
                      <button type="button" onClick={showPoll}>반나절만 머물고 다른 곳도 가기</button>
                      <button type="button" onClick={() => setStage("welcome")}>조금 더 이야기해 볼게요</button>
                    </div>
                  </div>
                </article>
              </>
            )}

            {showPollCard && (
              <>
                <p className="community-chat__my-message">비용이 적은 대체 장소 찾기</p>
                <article className="community-chat__ai-message">
                  <AiAvatar />
                  <div>
                    <strong>도틀로 AI</strong>
                    <div className="community-chat__ai-bubble">
                      <p>부담 없는 곳으로 골랐어요.</p>
                      <p>마음에 드는 곳에 투표해 주세요!</p>
                    </div>
                    <section className="community-poll" aria-labelledby="community-poll-title">
                      <header>
                        <h2 id="community-poll-title">2일차에 어디 갈까요?</h2>
                        <span>3명 중 2명 투표</span>
                      </header>
                      <div>
                        {pollOptions.map((option) => (
                          <button
                            className={selectedPollId === option.id ? "is-selected" : ""}
                            type="button"
                            aria-pressed={selectedPollId === option.id}
                            onClick={() => setSelectedPollId(option.id)}
                            key={option.id}
                          >
                            <span className="community-poll__check" aria-hidden="true">
                              {selectedPollId === option.id ? "✓" : ""}
                            </span>
                            <span><strong>{option.title}</strong><small>{option.detail}</small></span>
                            <b>{option.votes}</b>
                          </button>
                        ))}
                      </div>
                      <button className="community-poll__apply" type="button" onClick={openDayPicker}>
                        1위 장소 일정에 넣기
                      </button>
                    </section>
                  </div>
                </article>
              </>
            )}

            {stage === "applied" && (
              <>
                <p className="community-chat__system">이지우님이 투표했어요</p>
                <article className="community-chat__ai-message">
                  <AiAvatar />
                  <div>
                    <strong>도틀로 AI</strong>
                    <div className="community-chat__ai-bubble">
                      <p>투표 결과를 반영했어요.</p>
                      <p>오사카성 공원을 2일차 일정에 추가했어요!</p>
                    </div>
                    <div className="community-chat__result-card">
                      <span>2일차에 추가</span>
                      <strong>오사카성 공원</strong>
                      <small>공원 · 입장 무료</small>
                      <button type="button" onClick={onViewCourse}>코스에서 보기</button>
                    </div>
                  </div>
                </article>
              </>
            )}

            {sentMessages.map((sentMessage, index) => (
              <p className="community-chat__my-message" key={`${sentMessage}-${index}`}>
                {sentMessage}
              </p>
            ))}
          </>
        )}
      </section>

      <footer className="community-chat__composer">
        <div className="community-chat__quick-actions">
          <button type="button" onClick={() => setStage("welcome")}><b>@도틀로</b> 일정 점검</button>
          <button type="button" onClick={showSummary}><b>@도틀로</b> 의견 조율</button>
          <button type="button" onClick={showPoll}><b>@도틀로</b> 투표 만들기</button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <label>
            <span className="course-community__sr-only">채팅 메시지</span>
            <input
              value={message}
              placeholder="메시지를 입력하거나 @도틀로를 불러보세요"
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button type="submit" disabled={!message.trim()} aria-label="메시지 보내기">↑</button>
        </form>
        <span className="community-chat__home-indicator" aria-hidden="true" />
      </footer>

      {stage === "day-picker" && (
        <div className="community-day-picker" role="dialog" aria-modal="true" aria-labelledby="day-picker-title">
          <section>
            <header>
              <h2 id="day-picker-title">어느 날에 넣을까요?</h2>
              <p>이동 동선을 고려해 2일차를 추천해요</p>
            </header>
            <div>
              {communityDays.map((day) => (
                <button
                  className={selectedDay === day.id ? "is-selected" : ""}
                  type="button"
                  onClick={() => setSelectedDay(day.id)}
                  key={day.id}
                >
                  {day.recommended && <small>추천</small>}
                  <strong>{day.label}</strong>
                  <span>{day.date}</span>
                </button>
              ))}
            </div>
            <button className="community-day-picker__apply" type="button" onClick={applyToCourse}>
              {selectedDay}일차에 넣기
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default CourseCommunityChat;
