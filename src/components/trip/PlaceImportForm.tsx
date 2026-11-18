import { useId, useRef, useState, type ClipboardEvent } from "react";
import googleMapsLogo from "../../assets/images/brand-google-maps.webp";
import checkIcon from "../../assets/place-import/upload-02.svg";
import chevronIcon from "../../assets/place-import/upload-more.svg";
import fileRemoveIcon from "../../assets/place-import/file-remove.svg";
import linkIcon from "../../assets/place-import/method-07.svg";
import uploadEmptyIcon from "../../assets/place-import/upload-01.svg";
import uploadIcon from "../../assets/place-import/upload-03.svg";
import uploadErrorIcon from "../../assets/place-import/upload-04.svg";
import zipIcon from "../../assets/place-import/method-04.svg";
import linkCheck from "../../assets/place-import/link-check.svg";
import linkLock from "../../assets/place-import/link-lock.svg";
import linkPaste from "../../assets/place-import/link-paste.svg";
import linkSpinner from "../../assets/place-import/link-spinner.svg";
import linkStatusSpinner from "../../assets/place-import/link-status-spinner.svg";
import loadingCharacter from "../../assets/trip-generation-illustration.png";
import loadingDots from "../../assets/place-import/loading-dots.svg";
import { extractMapsListLink, validateMapsListLink, validateTakeoutFile } from "../../utils/placeImport";
import * as I from "./PlaceImportForm.styled";

export type PlaceImportInput =
  | { method: "file"; file: File }
  | { method: "link"; link: string };

export type PlaceImportView = "method" | "guide" | "file" | "link";

interface PlaceImportFormProps {
  onImport: (input: PlaceImportInput) => void | Promise<void>;
  onSkip?: () => void;
  busy?: boolean;
  enriching?: boolean;
  importError?: string;
  view?: PlaceImportView;
  onViewChange?: (view: PlaceImportView) => void;
}

const supportRows = [
  "Google Takeout에서 ‘저장됨(Saved)’으로 내보낸 ZIP 또는 CSV",
  "ZIP 안에 다른 Google 데이터가 있어도 저장 장소만 가져와요",
  "리스트 이름은 CSV 파일 이름으로 표시돼요",
  "이미 가져온 장소는 중복으로 저장하지 않아요",
  "JSON 파일(별표 표시한 장소)은 아직 지원하지 않아요",
];

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function PlaceImportForm({ onImport, onSkip, busy = false, enriching = false, importError = "", view: controlledView, onViewChange }: PlaceImportFormProps) {
  const fileInputId = useId();
  const linkInputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [localView, setLocalView] = useState<PlaceImportView>("method");
  const view = controlledView ?? localView;
  const setView = (next: PlaceImportView) => {
    setLocalView(next);
    onViewChange?.(next);
  };
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [dismissedImportError, setDismissedImportError] = useState("");
  const fileError = file ? validateTakeoutFile(file) : "";
  const visibleError = error || (dismissedImportError === importError ? "" : importError);

  function changeLink(value: string) {
    setLink(extractMapsListLink(value) ?? value);
    setError("");
    setDismissedImportError(importError);
  }

  async function pasteLink() {
    try {
      const value = await navigator.clipboard.readText();
      if (value.trim()) changeLink(value.trim());
    } catch {
      setError("링크 입력란에 직접 붙여넣어 주세요.");
    }
  }

  function pasteSharedText(event: ClipboardEvent<HTMLInputElement>) {
    const url = extractMapsListLink(event.clipboardData.getData("text/plain"));
    if (!url) return;
    event.preventDefault();
    changeLink(url);
  }

  function selectFile(selected: File | null) {
    setFile(selected);
    setError(selected ? validateTakeoutFile(selected) : "");
    setDismissedImportError(importError);
    setView("file");
  }

  function submitFile() {
    if (busy) return;
    if (!file) return setError("Takeout 파일을 선택해 주세요.");
    const message = validateTakeoutFile(file);
    setError(message);
    setDismissedImportError("");
    if (!message) void onImport({ method: "file", file });
  }

  function submitLink() {
    if (busy) return;
    const message = validateMapsListLink(link);
    setError(message);
    setDismissedImportError("");
    if (!message) void onImport({ method: "link", link: link.trim() });
  }

  if (enriching) return (
    <I.ImportProgress role="status">
      <img className="character" src={loadingCharacter} alt="" />
      <h1>저장한 장소를 불러오고 있어요</h1>
      <p>장소의 주소와 위치 정보를 확인하고 있어요.<br />잠시만 기다려 주세요.</p>
      <img className="dots" src={loadingDots} alt="" />
    </I.ImportProgress>
  );

  if (view === "method") return (
    <I.Flow aria-label="Google 지도 장소 가져오기">
      <I.Heading>
        <h1>Google 지도 장소 가져오기</h1>
        <p><img src={googleMapsLogo} alt="" />Google 지도에 저장해 둔 여행 장소를 도틀로로 가져와 보세요.</p>
      </I.Heading>
      <I.MethodList>
        <I.MethodCard type="button" onClick={() => { setError(""); setDismissedImportError(importError); setView("link"); }}>
          <I.MethodIcon $tone="purple"><img src={linkIcon} alt="" /></I.MethodIcon>
          <I.MethodContent>
            <strong>공유 리스트 링크로 가져오기</strong>
            <p>Google 지도에서 공유한 리스트 링크를 붙여넣어 가져와요.</p>
            <I.Badges><b>추천</b><span>공개 리스트만 가능</span></I.Badges>
          </I.MethodContent>
          <img src={chevronIcon} alt="" />
        </I.MethodCard>
        <I.MethodCard type="button" onClick={() => setView("guide")}>
          <I.MethodIcon $tone="blue"><img src={zipIcon} alt="" /></I.MethodIcon>
          <I.MethodContent>
            <strong>Takeout 파일로 가져오기</strong>
            <p>Google에서 내려받은 ZIP 또는 CSV 파일을 올려 저장 리스트를 한 번에 가져와요.</p>
            <I.Badges><span>ZIP · CSV</span><span>최대 20MB</span><span>저장됨(Saved)만 지원</span></I.Badges>
          </I.MethodContent>
          <img src={chevronIcon} alt="" />
        </I.MethodCard>
      </I.MethodList>
      {onSkip && <I.MethodSkipButton type="button" onClick={onSkip}>나중에 할게요</I.MethodSkipButton>}
    </I.Flow>
  );

  if (view === "guide") return (
    <I.Flow>
      <I.Heading><h1>3단계면 준비가 끝나요</h1><p>Google Takeout은 내 Google 데이터를 파일로 내려받는 Google 공식 기능이에요.</p></I.Heading>
      <I.GuideList>
        <I.GuideStep>
          <div><b>1</b><span><strong>Google에서 파일 만들기</strong><small>Takeout에서 저장한 장소만 골라 내보내요.</small></span></div>
          <I.GuideChecks>
            {["‘모두 선택 해제’ 누르기", "‘저장됨(Saved)’ 하나만 체크하기", "‘다음 단계’ → ‘내보내기 생성’ 누르기"].map((step) => (
              <p key={step}><img src={checkIcon} alt="" />{step}</p>
            ))}
            <small>‘지도(내 장소)’가 아니라 ‘저장됨’을 골라 주세요.</small>
          </I.GuideChecks>
          <I.ExternalLink href="https://takeout.google.com/" target="_blank" rel="noreferrer">Google Takeout 열기</I.ExternalLink>
        </I.GuideStep>
        <I.GuideStep><div><b>2</b><span><strong>Google 이메일 기다리기</strong><small>준비되면 Google이 이메일을 보내줘요.</small></span></div></I.GuideStep>
        <I.GuideStep><div><b>3</b><span><strong>도틀로에 그대로 올리기</strong><small>ZIP 파일은 압축을 풀지 않고 그대로 올려주세요.</small></span></div></I.GuideStep>
      </I.GuideList>
      <I.FormFooter>
        <I.PrimaryButton type="button" onClick={() => { setError(""); setDismissedImportError(importError); setView("file"); }}>파일이 준비됐어요</I.PrimaryButton>
        {onSkip && <I.SkipButton type="button" onClick={onSkip}>나중에 할게요</I.SkipButton>}
      </I.FormFooter>
    </I.Flow>
  );

  if (view === "link") return (
    <I.Flow>
      <I.Heading><h1>공유 리스트 링크를 붙여넣어 주세요</h1><p>Google 지도에서 공개로 설정한 리스트만 가져올 수 있어요.</p></I.Heading>
      <I.LinkForm noValidate onSubmit={(event) => { event.preventDefault(); submitLink(); }}>
        <I.LinkField>
          <label htmlFor={linkInputId}>리스트 링크</label>
          <I.LinkInput>
            <input id={linkInputId} type="url" placeholder="https://maps.app.goo.gl/…" value={link} readOnly={busy}
              onChange={(event) => changeLink(event.target.value)} onPaste={busy ? undefined : pasteSharedText} />
            {busy ? <img src={linkCheck} alt="" /> : (
              <button type="button" onClick={() => void pasteLink()}><img src={linkPaste} alt="" />붙여넣기</button>
            )}
          </I.LinkInput>
          {busy && (
            <I.LinkProgress role="status">
              <I.Spinner src={linkStatusSpinner} alt="" />
              리스트를 가져오고 있어요. 잠시만 기다려 주세요.
            </I.LinkProgress>
          )}
        </I.LinkField>
        {!busy && <I.LinkGuide>
          <strong>리스트를 공개로 설정하는 방법</strong>
          <ol>
            <li>지도 홈이 열리면 [나] 또는 [저장됨]을 눌러요</li>
            <li>가져올 리스트를 열고 [공유]를 눌러요</li>
            <li>링크로 볼 수 있도록 공개 설정을 켜요</li>
            <li>링크를 복사하고 도틀로에 돌아와 붙여넣어요</li>
          </ol>
          <I.ExternalLink href="https://www.google.com/maps/@/data=!4m2!10m1!1e1?hl=ko" target="_blank" rel="noreferrer">
            구글맵으로 이동하기
          </I.ExternalLink>
        </I.LinkGuide>}
        <I.InfoBox><img src={linkLock} alt="" /><p>공개 리스트는 링크를 가진 누구나 볼 수 있어요. 개인적인 장소가 포함되어 있지 않은지 확인해 주세요.</p></I.InfoBox>
        {visibleError && <I.ErrorBox role="alert"><img src={uploadErrorIcon} alt="" /><p>{visibleError}</p></I.ErrorBox>}
        <I.FormFooter>
          <I.PrimaryButton type="submit" $busy={busy} disabled={busy || !link.trim()}>
            {busy ? <><I.Spinner src={linkSpinner} alt="" />가져오는 중</> : link.trim() ? "장소 가져오기" : "링크를 붙여넣어 주세요"}
          </I.PrimaryButton>
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
          <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>변경</button>
          <button type="button" disabled={busy} aria-label="선택한 파일 지우기" onClick={() => { selectFile(null); if (fileInput.current) fileInput.current.value = ""; }}><img src={fileRemoveIcon} alt="" /></button>
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
        <I.PrimaryButton type="button" $busy={busy} disabled={busy || !file || Boolean(fileError)} onClick={submitFile}>
          {busy ? <><I.Spinner src={linkSpinner} alt="" />가져오는 중</> : "장소 가져오기"}
        </I.PrimaryButton>
        <I.GuideLink type="button" disabled={busy} onClick={() => setView("guide")}>파일 준비 방법 보기 <img src={chevronIcon} alt="" /></I.GuideLink>
      </I.FormFooter>
    </I.Flow>
  );
}

export default PlaceImportForm;
