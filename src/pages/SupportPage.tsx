import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import backIcon from "../assets/icons/nav-back.svg";
import addPhotoIcon from "../assets/support/add-photo.svg";
import chevronDownIcon from "../assets/support/chevron-down.svg";
import chevronUpIcon from "../assets/support/chevron-up.svg";
import newDotIcon from "../assets/support/new-dot.svg";
import { isApiEnabled } from "../api/config";
import { routes } from "../config/routes";
import { sampleNotices } from "../data/mocks/supportNotices";
import * as S from "./SupportPage.styled";

const maxPhotos = 3;

const faqItems = [
  { category: "Google Maps", question: "Google Maps 저장 장소는 어떻게 불러오나요?", answer: "여행 만들기의 저장 장소에서 Google Maps 공개 목록 링크를 입력하거나 Takeout ZIP·CSV 파일을 선택해 주세요." },
  { category: "Google Maps", question: "불러온 장소가 보이지 않아요", answer: "Google Maps 목록이 공개되어 있는지 확인해 주세요. 파일을 사용하는 경우 Takeout에서 내보낸 ZIP 또는 CSV 파일을 선택해 주세요." },
  { category: "함께 계획", question: "친구와 함께 일정을 짜려면 어떻게 하나요?", answer: "실제 여행의 코스 설정에서 친구 초대를 열고 링크를 보내세요. 상대방이 로그인 후 초대를 수락하면 멤버 관리에서 확인할 수 있어요." },
  { category: "함께 계획", question: "AI가 만든 코스를 수정할 수 있나요?", answer: "장소 순서를 바꾸거나 다른 장소로 교체할 수 있고, AI에게 자연어로 수정 요청을 보낼 수도 있어요." },
  { category: "계정", question: "로그아웃은 어디에서 하나요?", answer: "마이의 계정 관리에서 로그아웃을 선택해 주세요." },
];

function Header({ title }: { title: string }) {
  return (
    <S.Header>
      <Link to={routes.my} aria-label="마이 화면으로 돌아가기"><img src={backIcon} alt="" /></Link>
      <h1>{title}</h1>
    </S.Header>
  );
}

function SupportPage() {
  const location = useLocation();
  const [category, setCategory] = useState("전체");
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaq = useMemo(
    () => category === "전체" ? faqItems : faqItems.filter((item) => item.category === category),
    [category],
  );

  if (location.pathname === routes.notices) {
    const notices = import.meta.env.DEV && !isApiEnabled() ? sampleNotices : [];
    return (
      <S.Page>
        <Header title="공지사항" />
        {notices.length ? <S.NoticeList>
          {notices.map((notice) => (
            <li key={notice.title}>
              <span data-new={notice.isNew}>{notice.category}{notice.isNew && <img src={newDotIcon} alt="새 글" />}</span>
              <strong>{notice.title}</strong>
              <small>{notice.date}</small>
            </li>
          ))}
        </S.NoticeList> : <S.SupportNotice>표시할 공지사항이 없어요.</S.SupportNotice>}
      </S.Page>
    );
  }

  if (location.pathname === routes.faq) {
    return (
      <S.Page>
        <Header title="자주 묻는 질문" />
        <S.Categories>
          {["전체", "Google Maps", "함께 계획", "계정"].map((item) => (
            <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setOpenFaq(0); }}>{item}</button>
          ))}
        </S.Categories>
        <S.FaqList>
          {filteredFaq.map((item, index) => (
            <li key={item.question}>
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <b>Q</b><strong>{item.question}</strong><img src={openFaq === index ? chevronUpIcon : chevronDownIcon} alt="" />
              </button>
              {openFaq === index && <p>{item.answer}</p>}
            </li>
          ))}
        </S.FaqList>
        <S.Contact><span>찾는 답이 없나요?</span><Link to={routes.feedback}>도틀로에 의견 보내기</Link></S.Contact>
      </S.Page>
    );
  }

  return <FeedbackPage />;
}

function FeedbackPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const canSend = Boolean(feedbackType && message.trim());
  const sendFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    const subject = `[도틀로 의견] ${feedbackType}`;
    const body = `${message.trim()}${photos.length ? "\n\n사진은 메일에 직접 첨부해 주세요." : ""}`;
    window.location.href = `mailto:contact.dotlo.team@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <S.Page>
      <Header title="의견 보내기" />
      <S.FeedbackForm onSubmit={sendFeedback}>
        <fieldset>
          <legend>어떤 이야기를 들려주실래요?</legend>
          <div>
            {["불편해요", "제안해요", "칭찬해요"].map((item) => (
              <button type="button" key={item} aria-pressed={feedbackType === item} onClick={() => setFeedbackType(item)}>{item}</button>
            ))}
          </div>
        </fieldset>
        <label htmlFor="feedback-message">내용</label>
        <S.MessageBox>
          <textarea id="feedback-message" maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} />
          <small>{message.length}/1000</small>
        </S.MessageBox>
        <strong>사진 첨부 (선택)</strong>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(event) => {
          const input = event.currentTarget;
          const selected = Array.from(input.files ?? []).filter((file) => file.type.startsWith("image/"));
          setPhotos((current) => [...current, ...selected].slice(0, maxPhotos));
          input.value = "";
        }} />
        <S.PhotoButton type="button" aria-label="사진 첨부" disabled={photos.length >= maxPhotos} onClick={() => fileInput.current?.click()}>
          <img src={addPhotoIcon} alt="" /><span>{photos.length}/{maxPhotos}</span>
        </S.PhotoButton>
        {photos.length > 0 && (
          <S.AttachmentList>
            {photos.map((photo, index) => (
              <li key={`${photo.name}-${index}`}>
                <span>{photo.name}</span>
                <button type="button" aria-label={`${photo.name} 제거`} onClick={() => {
                  setPhotos((current) => current.filter((_, position) => position !== index));
                }}>제거</button>
              </li>
            ))}
          </S.AttachmentList>
        )}
        {photos.length > 0 && <S.SupportNotice id="feedback-availability">메일 앱이 열리면 사진을 직접 첨부해 주세요.</S.SupportNotice>}
        <S.Submit type="submit" aria-describedby={photos.length ? "feedback-availability" : undefined} disabled={!canSend}>보내기</S.Submit>
      </S.FeedbackForm>
    </S.Page>
  );
}

export default SupportPage;
