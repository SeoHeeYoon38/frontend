import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import closeIcon from "../assets/icons/action-close.svg";
import { routes } from "../config/routes";
import * as S from "./PrivacyPolicyPage.styled";

const purposes = [
  "회원 식별, 로그인 및 계정 관리",
  "이용자의 여행 조건에 따른 맞춤형 여행 코스 생성",
  "생성·수정·저장한 여행 코스의 보관 및 조회",
];

const collectedItems = [
  "회원 정보: Google 소셜 계정 식별자, 이메일 주소, 닉네임, 프로필 이미지",
  "여행 정보: 여행 지역, 일정, 관심 장소, 여행 취향 및 저장한 여행 코스",
];

const retentionItems = [
  "회원 정보: 회원 탈퇴 시까지",
  "여행 정보: 해당 여행을 삭제하거나 회원 탈퇴할 때까지",
];

function BulletList({ items }: { items: string[] }) {
  return (
    <S.BulletList>
      {items.map((item) => <li key={item}>{item}</li>)}
    </S.BulletList>
  );
}

function PrivacyPolicyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromLogin = new URLSearchParams(location.search).get("from") === "login";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "개인정보 수집 및 이용 | Dotlo";
    return () => { document.title = previousTitle; };
  }, []);

  const close = () => navigate(fromLogin ? `${routes.login}?terms=1` : routes.login, {
    state: fromLogin ? location.state : null,
  });

  return (
    <S.Page>
      <S.Header>
        <h1>개인정보 수집 및 이용</h1>
        <button type="button" aria-label="개인정보 수집 및 이용 닫기" onClick={close}>
          <img src={closeIcon} alt="" />
        </button>
      </S.Header>

      <S.Document $withAction={fromLogin}>
        <S.Required>필수</S.Required>
        <S.Lead>
          도틀로(Dotlo)는 회원가입 및 여행 코스 생성·저장 기능 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.
        </S.Lead>

        <S.Section>
          <h2>1. 수집·이용 목적</h2>
          <BulletList items={purposes} />
        </S.Section>

        <S.Section>
          <h2>2. 수집·이용 항목</h2>
          <BulletList items={collectedItems} />
        </S.Section>

        <S.Section>
          <h2>3. 보유 및 이용 기간</h2>
          <BulletList items={retentionItems} />
          <p>
            보유 기간이 경과하거나 이용 목적이 달성된 개인정보는 지체 없이 파기합니다. 다만, 관련 법령에 따라 보관해야 하는 경우에는 해당 법령에서 정한 기간 동안 별도로 보관한 후 파기합니다.
          </p>
        </S.Section>

        <S.Section>
          <h2>4. 동의 거부 권리 및 불이익</h2>
          <p>
            이용자는 개인정보 수집·이용에 대한 동의를 거부할 수 있습니다. 다만, 동의를 거부하면 회원 식별과 맞춤형 여행 코스 생성·저장 등 해당 정보가 반드시 필요한 기능의 이용이 제한됩니다.
          </p>
        </S.Section>

        <S.Section>
          <h2>5. 동의 철회 및 문의</h2>
          <p>
            이용자는 마이 &gt; 계정 관리 &gt; 회원탈퇴를 통해 동의를 철회할 수 있으며, 개인정보의 열람, 정정·삭제 및 처리정지를 요청할 수 있습니다.
          </p>
          <S.ContactBox>문의: 도틀로 앱 내 마이 &gt; 의견 보내기</S.ContactBox>
          <p>개인정보 처리에 관한 자세한 문의도 위 경로를 통해 접수할 수 있습니다.</p>
        </S.Section>

        <S.EffectiveDate>시행일 2026년 4월 2일</S.EffectiveDate>
      </S.Document>

      {fromLogin && (
        <S.ActionBar>
          <button type="button" onClick={close}>동의하기</button>
        </S.ActionBar>
      )}
    </S.Page>
  );
}

export default PrivacyPolicyPage;
