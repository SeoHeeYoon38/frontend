import { Fragment, useEffect, useRef, useState } from "react";
import backIcon from "../../assets/figma/traveler-back.svg";
import aiAvatar from "../../assets/course-community/ai-avatar.png";
import sendIcon from "../../assets/course-community/send.svg";
import type { TravelerCoursePlace } from "../../types/course";
import { sannenzakaDetail } from "../../data/mocks/travelerCourseData";
import * as S from "./TravelerCourseOverlay.styled";

interface TravelerAiChatProps {
  place?: TravelerCoursePlace;
  live?: boolean;
  onBack: () => void;
}

const suggestions = ["근처 찻집 추천해 줘", "계단이 많은 편인가요?", "사진 찍기 좋은 시간은?"];
const admissionAnswer = "아니요, 산넨자카는 누구나 자유롭게 걸을 수 있는 거리라 입장료가 없어요.\n\n골목의 상점과 찻집은 대부분 09:00 ~ 18:00에 열어요. 골목 끝의 기요미즈데라는 입장료가 따로 있으니 함께 방문한다면 참고하세요.\n\n돌계단이 많아서 편한 신발을 추천해요.";

function sampleExcerpt(question: string) {
  if (/입장료|입장권/.test(question)) return admissionAnswer;
  if (/계단|미끄/.test(question)) return sannenzakaDetail.reviewHighlights[2];
  if (/사진|촬영/.test(question)) return sannenzakaDetail.reviewHighlights[0];
  if (/영업|운영시간/.test(question)) return sannenzakaDetail.hours;
  if (question === suggestions[0]) return "장소 소개에 나온 찻집 정보예요. " + sannenzakaDetail.description;
}

function TravelerAiChat({ place, live = false, onBack }: TravelerAiChatProps) {
  const name = place?.name || "산넨자카 골목";
  const image = place?.image;
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<{ question: string; excerpt?: string }[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const sample = !live && place?.id === sannenzakaDetail.id;

  useEffect(() => {
    if (questions.length) end.current?.scrollIntoView({ block: "nearest" });
  }, [questions.length]);

  return (
    <S.AiScreen>
      <S.AiHeader>
        <button type="button" aria-label="장소 상세로 돌아가기" onClick={onBack}><img src={backIcon} alt="" /></button>
        {image && <img src={image} alt="" />}
        <span><strong>{name}</strong><small>도틀로 AI</small></span>
      </S.AiHeader>

      <S.AiMessages>
        <S.AiMessage>
          <img src={aiAvatar} alt="" />
          <div><small>도틀로 AI</small><p>{!sample ? "공개 코스의 장소 AI 답변은 아직 이용할 수 없어요." : <>
            {name}에 대해 궁금한 걸 물어보세요.<br />영업시간, 근처 맛집, 동선까지 알려드릴게요.
          </>}</p></div>
        </S.AiMessage>
        {sample && <>
        <S.UserMessage>여기에 입장료가 있나요?</S.UserMessage>
        <S.AiMessage>
          <img src={aiAvatar} alt="" />
          <div>
            <small>도틀로 AI</small>
            <p>{admissionAnswer}</p>
            <button type="button" onClick={onBack}>참고한 정보 보기</button>
          </div>
        </S.AiMessage>
        </>}
        {questions.map(({ question, excerpt }, index) => <Fragment key={index}>
          <S.UserMessage>{question}</S.UserMessage>
          <S.AiMessage>
            <img src={aiAvatar} alt="" />
            <div><small>도틀로 AI</small>
              <p>{excerpt ?? "장소 소개와 리뷰에서 이 질문에 대한 정보를 찾지 못했어요."}</p>
              {excerpt && <button type="button" onClick={onBack}>참고한 정보 보기</button>}
            </div>
          </S.AiMessage>
        </Fragment>)}
        {questions.length > 0 && <div ref={end} />}
      </S.AiMessages>

      <S.AiComposer>
        {sample && <S.AiSuggestions>
          {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setMessage(suggestion)}>{suggestion}</button>)}
        </S.AiSuggestions>}
        <form onSubmit={(event) => {
          event.preventDefault();
          const question = message.trim();
          if (!sample || !question) return;
          setQuestions(current => [...current, { question, excerpt: sampleExcerpt(question) }]);
          setMessage("");
        }}>
          <input aria-label={`${name} 질문`} disabled={!sample} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`${name.replace(" 골목", "")}에 대해 물어보세요`} />
          <button type="submit" aria-label="질문 보내기" disabled={!sample || !message.trim()}><img src={sendIcon} alt="" /></button>
        </form>
      </S.AiComposer>
    </S.AiScreen>
  );
}

export default TravelerAiChat;
