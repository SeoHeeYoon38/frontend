import { useId, useState } from "react";
import styled from "styled-components";
import { validateMapsListLink, validateTakeoutFile } from "../../utils/placeImport";
import { ErrorText, Primary } from "./Trip.styled";
import { PlaceTabs } from "./SavedPlacesStep.styled";

const Form = styled.form`
  display: grid;
  gap: 12px;
  text-align: left;

  > p {
    margin: 0;
    color: #5c5c63;
    font-size: 13px;
    line-height: 1.5;
  }

  > label {
    font-size: 14px;
    font-weight: 700;
  }

  > input {
    width: 100%;
    min-width: 0;
    padding: 12px;
    border: 1px solid #e4e6ec;
    border-radius: 12px;
    font-size: 14px;
  }
`;

export type PlaceImportInput =
  | { method: "file"; file: File }
  | { method: "link"; link: string };

function PlaceImportForm({
  onImport,
  busy = false,
}: {
  onImport: (input: PlaceImportInput) => void | Promise<void>;
  busy?: boolean;
}) {
  const fieldId = useId();
  const [method, setMethod] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const message = method === "file"
          ? file ? validateTakeoutFile(file) : "Takeout 파일을 선택해 주세요."
          : validateMapsListLink(link);
        setError(message);
        if (!message) {
          void onImport(
            method === "file"
              ? { method, file: file! }
              : { method, link: link.trim() },
          );
        }
      }}
    >
      <p>로그인 상태에서는 저장 장소를 서버로 가져오고, 미리보기 상태에서는 샘플 장소를 보여드려요.</p>
      <PlaceTabs aria-label="장소 가져오기 방법">
        <button type="button" aria-pressed={method === "file"} onClick={() => { setMethod("file"); setError(""); }}>
          Takeout 파일
        </button>
        <button type="button" aria-pressed={method === "link"} onClick={() => { setMethod("link"); setFile(null); setError(""); }}>
          공유 링크
        </button>
      </PlaceTabs>
      {method === "file" ? (
        <>
          <label htmlFor={fieldId}>Takeout 파일 선택</label>
          <p id={`${fieldId}-help`}>Google Takeout에서 ‘저장됨’을 선택해 내보내세요. ZIP을 그대로 올리거나 CSV 한 개를 선택하세요. 최대 20MB예요.</p>
          <input
            key="file"
            id={fieldId}
            type="file"
            accept=".zip,.csv"
            aria-describedby={`${fieldId}-help`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0] ?? null;
              setFile(selected);
              setError(selected ? validateTakeoutFile(selected) : "");
            }}
          />
        </>
      ) : (
        <>
          <label htmlFor={fieldId}>공개 Google Maps 목록 링크</label>
          <p id={`${fieldId}-help`}>Google Maps 목록에서 공유 링크를 복사해 붙여넣으세요.</p>
          <input
            key="link"
            id={fieldId}
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            aria-describedby={`${fieldId}-help`}
            aria-invalid={Boolean(error)}
            value={link}
            onChange={(event) => { setLink(event.target.value); setError(""); }}
          />
        </>
      )}
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <Primary type="submit" disabled={busy}>
        {busy ? "장소를 가져오고 있어요" : "장소 불러오기"}
      </Primary>
    </Form>
  );
}

export default PlaceImportForm;
