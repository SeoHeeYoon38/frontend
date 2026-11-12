import { useId, useRef, useState } from "react";
import googleMapsLogo from "../../assets/images/brand-google-maps.webp";
import checkIcon from "../../assets/place-import/upload-02.svg";
import chevronIcon from "../../assets/place-import/upload-more.svg";
import fileRemoveIcon from "../../assets/place-import/file-remove.svg";
import infoIcon from "../../assets/place-import/method-info.svg";
import linkIcon from "../../assets/place-import/method-07.svg";
import uploadEmptyIcon from "../../assets/place-import/upload-01.svg";
import uploadIcon from "../../assets/place-import/upload-03.svg";
import uploadErrorIcon from "../../assets/place-import/upload-04.svg";
import zipIcon from "../../assets/place-import/method-04.svg";
import { validateMapsListLink, validateTakeoutFile } from "../../utils/placeImport";
import * as I from "./PlaceImportForm.styled";

export type PlaceImportInput =
  | { method: "file"; file: File }
  | { method: "link"; link: string };

type ImportView = "method" | "guide" | "file" | "link";

interface PlaceImportFormProps {
  onImport: (input: PlaceImportInput) => void | Promise<void>;
  onSkip?: () => void;
  busy?: boolean;
  importError?: string;
}

const supportRows = [
  "Google Takeout에서 ‘저장됨(Saved)’으로 내보낸 ZIP 또는 CSV",
  "ZIP 안에 다른 Google 데이터가 있어도 저장 장소만 가져와요",
  "리스트 이름은 CSV 파일 이름으로 표시돼요",
  "이미 가져온 장소는 중복으로 저장하지 않아요",
  "JSON 파일과 20MB를 넘는 파일은 아직 지원하지 않아요",
];

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function PlaceImportForm({ onImport, onSkip, busy = false, importError = "" }: PlaceImportFormProps) {
  const fileInputId = useId();
  const linkInputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ImportView>("method");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const fileError = file ? validateTakeoutFile(file) : "";
  const visibleError = error || importError;

  function selectFile(selected: File | null) {
    setFile(selected);
    setError(selected ? validateTakeoutFile(selected) : "");
    setView("file");
  }

  function submitFile() {
    if (!file) return setError("Takeout 파일을 선택해 주세요.");
    const message = validateTakeoutFile(file);
    setError(message);
    if (!message) void onImport({ method: "file", file });
  }

  function submitLink() {
    const message = validateMapsListLink(link);
    setError(message);
    if (!message) void onImport({ method: "link", link: link.trim() });
  }

  if (view === "method") return (
    <I.Flow aria-label="Google 지도 장소 가져오기">
      <I.Heading>
        <h1>Google 지도 장소 가져오기</h1>
        <p><img src={googleMapsLogo} alt="" />Google 지도에 저장해 둔 여행 장소를 도틀로로 가져와 보세요.</p>
      </I.Heading>
      <I.MethodList>
        <I.MethodCard type="button" onClick={() => setView("guide")}>
          <I.MethodIcon $tone="blue"><img src={zipIcon} alt="" /></I.MethodIcon>
          <I.MethodContent>
            <strong>Takeout 파일로 가져오기</strong>
            <p>Google에서 내려받은 ZIP 또는 CSV 파일을 올려 저장 리스트를 한 번에 가져와요.</p>
            <I.Badges><b>추천</b><span>ZIP · CSV</span><span>최대 20MB</span><span>저장됨(Saved)만 지원</span></I.Badges>
          </I.MethodContent>
          <img src={chevronIcon} alt="" />
        </I.MethodCard>
        <I.MethodCard type="button" onClick={() => setView("link")}>
          <I.MethodIcon $tone="purple"><img src={linkIcon} alt="" /></I.MethodIcon>
          <I.MethodContent>
            <strong>공유 리스트 링크로 가져오기</strong>
            <p>Google 지도에서 공유한 리스트 링크를 붙여넣어 가져와요.</p>
            <I.Badges><span>공개 리스트만 가능</span></I.Badges>
          </I.MethodContent>
          <img src={chevronIcon} alt="" />
        </I.MethodCard>
      </I.MethodList>
      <I.InfoBox><img src={infoIcon} alt="" /><p>처음이라면 Takeout 파일을 추천해요. 파일 준비에 시간이 걸릴 수 있으니, 지금 준비가 어렵다면 나중에 가져와도 괜찮아요.</p></I.InfoBox>
      {onSkip && <I.SkipButton type="button" onClick={onSkip}>나중에 할게요</I.SkipButton>}
    </I.Flow>
  );

  if (view === "guide") return (
    <I.Flow>
      <I.Heading><h1>Takeout 파일을 준비해 주세요</h1><p>처음 한 번만 준비하면 돼요. 순서대로 따라 해 주세요.</p></I.Heading>
      <I.GuideNotice><img src={infoIcon} alt="" /><p><strong>파일 준비에 시간이 걸릴 수 있어요</strong><br />Google이 준비를 완료하면 이메일을 보내드려요. 보통 몇 분에서 길게는 하루 정도 걸릴 수 있어요.</p></I.GuideNotice>
      <I.GuideList>
        <I.GuideStep><b>1</b><div><strong>Google Takeout에 접속해요</strong><small>takeout.google.com</small></div></I.GuideStep>
        <I.GuideStep><b>2</b><div><strong>‘모두 선택 해제’를 눌러요</strong><small>처음에는 모든 Google 서비스가 선택되어 있어요</small></div></I.GuideStep>
        <I.GuideStep><b>3</b><div><strong>목록에서 ‘저장됨(Saved)’만 선택해요</strong><small>‘지도(내 장소)’는 다른 데이터예요</small></div></I.GuideStep>
        <I.GuideStep><b>4</b><div><strong>‘다음 단계’ → ‘내보내기 생성’을 눌러요</strong><small>이메일로 다운로드 링크가 와요</small></div></I.GuideStep>
        <I.GuideStep><b>5</b><div><strong>준비 완료 이메일이 오면 파일을 내려받아요</strong><small>Google이 보낸 이메일에서 내려받을 수 있어요</small></div></I.GuideStep>
        <I.GuideStep><b>6</b><div><strong>내려받은 ZIP 파일을 도틀로에 올려요</strong><small>압축을 풀지 않고 그대로 올리면 돼요</small></div></I.GuideStep>
      </I.GuideList>
      <I.ExternalLink href="https://takeout.google.com/" target="_blank" rel="noreferrer">Google Takeout 열기</I.ExternalLink>
      <I.FormFooter>
        <I.PrimaryButton type="button" onClick={() => setView("file")}>파일이 준비됐어요</I.PrimaryButton>
        {onSkip && <I.SkipButton type="button" onClick={onSkip}>나중에 할게요</I.SkipButton>}
      </I.FormFooter>
    </I.Flow>
  );

  if (view === "link") return (
    <I.Flow>
      <I.Heading><h1>공유 리스트 링크를 붙여넣어 주세요</h1><p>공개로 공유된 Google 지도 리스트만 가져올 수 있어요.</p></I.Heading>
      <I.LinkForm onSubmit={(event) => { event.preventDefault(); submitLink(); }}>
        <label htmlFor={linkInputId}>Google 지도 공유 링크</label>
        <input id={linkInputId} type="url" placeholder="https://maps.app.goo.gl/…" value={link} disabled={busy} onChange={(event) => { setLink(event.target.value); setError(""); }} />
        {visibleError && <I.ErrorBox role="alert"><img src={uploadErrorIcon} alt="" /><p>{visibleError}</p></I.ErrorBox>}
        <I.FormFooter>
          <I.PrimaryButton type="submit" disabled={busy || !link.trim()}>{busy ? "장소 가져오는 중…" : "장소 가져오기"}</I.PrimaryButton>
          <I.GuideLink type="button" onClick={() => setView("method")}>다른 방법 선택하기 <img src={chevronIcon} alt="" /></I.GuideLink>
        </I.FormFooter>
      </I.LinkForm>
    </I.Flow>
  );

  return (
    <I.Flow aria-busy={busy}>
      <I.Heading><h1>Takeout 파일을 올려주세요</h1><p>ZIP 파일은 압축을 풀지 않고 그대로 올리면 돼요.</p></I.Heading>
      <input ref={fileInput} id={fileInputId} type="file" accept=".zip,.csv" hidden onChange={(event) => selectFile(event.currentTarget.files?.[0] ?? null)} />
      {file ? (
        <I.SelectedFile $error={Boolean(fileError)}>
          <I.FileIcon $error={Boolean(fileError)}><img src={zipIcon} alt="" /></I.FileIcon>
          <div><strong>{file.name}</strong><span>{formatFileSize(file.size)}</span></div>
          <button type="button" onClick={() => fileInput.current?.click()}>변경</button>
          <button type="button" aria-label="선택한 파일 지우기" onClick={() => { setFile(null); setError(""); if (fileInput.current) fileInput.current.value = ""; }}><img src={fileRemoveIcon} alt="" /></button>
        </I.SelectedFile>
      ) : (
        <I.DropZone htmlFor={fileInputId}>
          <I.EmptyIcon><img src={uploadEmptyIcon} alt="" /></I.EmptyIcon>
          <strong>파일을 선택해 주세요</strong>
          <span>ZIP 또는 CSV · 최대 20MB</span>
          <b><img src={uploadIcon} alt="" /> 파일 선택</b>
        </I.DropZone>
      )}
      {(fileError || visibleError) && <I.ErrorBox role="alert"><img src={uploadErrorIcon} alt="" /><p>{fileError || visibleError}<br /><small>파일을 확인한 뒤 다시 시도해 주세요.</small></p></I.ErrorBox>}
      <I.SupportBox>
        <strong>올릴 수 있는 파일</strong>
        {supportRows.map((row, index) => <p key={row}><img src={index === supportRows.length - 1 ? uploadErrorIcon : checkIcon} alt="" />{row}</p>)}
      </I.SupportBox>
      <I.FormFooter>
        <I.PrimaryButton type="button" disabled={busy || !file || Boolean(fileError)} onClick={submitFile}>{busy ? "장소 가져오는 중…" : "장소 가져오기"}</I.PrimaryButton>
        <I.GuideLink type="button" onClick={() => setView("guide")}>파일 준비 방법 보기 <img src={chevronIcon} alt="" /></I.GuideLink>
      </I.FormFooter>
    </I.Flow>
  );
}

export default PlaceImportForm;
