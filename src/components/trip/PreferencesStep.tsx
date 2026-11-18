import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Preferences, TripDraft } from "../../types/trip";
import type { PlaceCategoryCode, PreferenceProfile, PreferenceView, UserPreferenceView } from "../../api/types";
import promptAi from "../../assets/icons/ai-prompt-ai.svg";
import food from "../../assets/icons/ai-prompt-food.svg";
import camera from "../../assets/icons/ai-prompt-camera.svg";
import shopping from "../../assets/icons/ai-prompt-shopping.svg";
import person from "../../assets/icons/ai-prompt-person.svg";
import add from "../../assets/icons/ai-prompt-add.svg";
import removeChip from "../../assets/icons/ai-prompt-chip-remove.svg";
import addChip from "../../assets/icons/ai-prompt-chip-add.svg";
import sparkle from "../../assets/icons/status-ai-sparkle.svg";
import { analyzeMockPreferences } from "../../data/mocks/tripService";
import { isServerTripId, preferenceAnalysisToDraft, preferenceResultToDraft } from "../../api/adapters";
import { shouldUseMockFallback } from "../../api/client";
import { isApiEnabled } from "../../api/config";
import { hasAuthSession } from "../../api/tokenStorage";
import { analyzePreferences, getPreferences, getUserPreferences, savePreferences } from "../../api/preferences";
import * as S from "./Trip.styled";
import * as P from "./PreferencesStep.styled";

const promptLimit = 200;
const examples = [
  { text: "현지 맛집 위주로 먹방 여행", sentence: "현지 맛집 위주로 먹방 여행을 하고 싶어요.", icon: food },
  { text: "유명한 곳은 꼭, 일정은 여유롭게", sentence: "유명한 곳은 꼭 가고, 일정은 여유롭게 짜고 싶어요.", icon: camera },
  { text: "쇼핑하고 카페에서 쉬는 여행", sentence: "쇼핑하고 카페에서 쉬는 여행을 하고 싶어요.", icon: shopping },
  { text: "부모님과 함께, 많이 안 걷게", sentence: "부모님과 함께 가서 너무 많이 걷지 않으면 좋겠어요.", icon: person },
];

const interestLabels: Record<PlaceCategoryCode, string> = {
  FOOD: "미식", CAFE: "카페", SIGHTSEEING: "관광", SHOPPING: "쇼핑",
  NATURE: "자연", CULTURE: "문화", NIGHTLIFE: "야경", ACTIVITY: "체험", OTHER: "기타",
};
const paceChoices = [
  { label: "덜 걷기", field: "walking", value: "LESS" },
  { label: "많이 걷기", field: "walking", value: "MORE" },
  { label: "여유롭게", field: "pace", value: "RELAXED" },
  { label: "알차게", field: "pace", value: "PACKED" },
  { label: "일찍 시작", field: "dayStart", value: "EARLY" },
  { label: "늦게 시작", field: "dayStart", value: "LATE" },
] as const;
const companionChoices = ["혼자", "친구", "연인", "가족", "부모님"];
const chipGroups = [
  { key: "tastes", title: "취향", options: Object.values(interestLabels) },
  { key: "pace", title: "방식", options: paceChoices.map((choice) => choice.label) },
  { key: "companion", title: "동행", options: companionChoices },
] as const;
type ChipGroup = (typeof chipGroups)[number]["key"];
const companionNote = "동행: ";

function showPreferenceLabels(preferences: Preferences, draft: TripDraft) {
  const profile = preferences.apiProfile;
  const companions = profile?.notes
    .filter((note) => note.startsWith(companionNote))
    .flatMap((note) => note.slice(companionNote.length).split(", "));
  return {
    ...preferences,
    tastes: profile ? profile.interests.map((code) => interestLabels[code]) : preferences.tastes,
    pace: profile
      ? paceChoices.filter(({ field, value }) => profile[field] === value).map(({ label }) => label)
      : preferences.pace.filter((label) => label !== "보통 강도"),
    companion: companions?.length
      ? companions
      : preferences.text.includes("부모님")
        ? ["부모님"]
        : preferences.companion.length ? preferences.companion : draft.companion ? [draft.companion] : [],
  };
}

function updateProfile(profile: PreferenceProfile, group: ChipGroup, label: string, remove: boolean, selected: string[]) {
  if (group === "tastes") {
    const code = (Object.keys(interestLabels) as PlaceCategoryCode[]).find((key) => interestLabels[key] === label);
    if (!code) return profile;
    return {
      ...profile,
      interests: remove ? profile.interests.filter((value) => value !== code) : [...profile.interests, code],
      avoid: remove ? profile.avoid : profile.avoid.filter((value) => value !== code),
    };
  }
  if (group === "pace") {
    const option = paceChoices.find((choice) => choice.label === label);
    return option ? { ...profile, [option.field]: remove ? "NORMAL" : option.value } : profile;
  }
  const notes = profile.notes.filter((note) => !note.startsWith(companionNote));
  return { ...profile, notes: selected.length ? [...notes, companionNote + selected.join(", ")] : notes };
}

interface PreferencesStepProps {
  draft: TripDraft;
  onChange: (draft: TripDraft) => void;
  onGenerate: (draft: TripDraft) => Promise<void>;
  error: string;
}

function PreferencesStep({ draft, onChange, onGenerate, error }: PreferencesStepProps) {
  const preferences = draft.preferences;
  const text = preferences.text;
  const excess = Math.max(0, text.length - promptLimit);
  const live = isApiEnabled() && hasAuthSession() && isServerTripId(draft.tripId);
  const [busy, setBusy] = useState(false);
  const [hydratedTripId, setHydratedTripId] = useState<string>();
  const loadingPreferences = live && !text && !preferences.analyzed && !preferences.apiProfile
    && hydratedTripId !== draft.tripId;
  const [composing, setComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const request = useRef<{ controller: AbortController; result: Promise<Preferences | null> } | null>(null);
  const hydration = useRef<AbortController | null>(null);
  const submission = useRef(false);
  const attemptedPrompt = useRef<string | null>(null);

  const applySavedPreferences = useEffectEvent((initial: PreferenceView | UserPreferenceView) => {
    if (initial.saved) {
      const saved = showPreferenceLabels(preferenceResultToDraft(initial, draft), draft);
      onChange({ ...draft, preferences: saved });
    }
  });

  useEffect(() => {
    if (!loadingPreferences) return;
    const controller = new AbortController();
    const { signal } = controller;
    hydration.current = controller;
    void getPreferences(Number(draft.tripId), signal)
      .then((saved) => saved.saved ? saved : getUserPreferences(signal))
      .then((saved) => { if (!signal.aborted) applySavedPreferences(saved); })
      .catch((reason: unknown) => {
        if (!signal.aborted && !shouldUseMockFallback(reason)) {
          setAnalysisError(reason instanceof Error ? reason.message : "저장된 여행 취향을 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (hydration.current === controller) {
          hydration.current = null;
          if (!signal.aborted) setHydratedTripId(draft.tripId);
        }
      });
    return () => controller.abort();
  }, [draft.tripId, loadingPreferences]);

  useEffect(() => () => request.current?.controller.abort(), []);

  function changeText(value: string) {
    hydration.current?.abort();
    hydration.current = null;
    request.current?.controller.abort();
    request.current = null;
    setBusy(false);
    setHydratedTripId(draft.tripId);
    attemptedPrompt.current = null;
    setAnalysisError("");
    onChange({
      ...draft,
      preferences: { text: value, tastes: [], pace: [], companion: [], analyzed: false },
    });
  }

  function analyze() {
    if (request.current) return request.current.result;
    attemptedPrompt.current = text;
    const controller = new AbortController();
    setBusy(true);
    setAnalysisError("");
    const result = (async () => {
      if (live) {
        try {
          const response = await analyzePreferences(Number(draft.tripId), text, controller.signal);
          return preferenceAnalysisToDraft(response, draft);
        } catch (reason) {
          if (!shouldUseMockFallback(reason)) throw reason;
        }
      } else if (import.meta.env.PROD) {
        throw new Error("여행 정보를 먼저 저장해 주세요.");
      }
      return analyzeMockPreferences(text, controller.signal);
    })().then((response) => {
      if (controller.signal.aborted) return null;
      const next = showPreferenceLabels(response, draft);
      onChange({ ...draft, preferences: next });
      return next;
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        setAnalysisError(reason instanceof Error ? reason.message : "여행 취향을 정리하지 못했어요. 다시 시도해 주세요.");
      }
      return null;
    }).finally(() => {
      if (request.current?.controller === controller) {
        request.current = null;
        setBusy(false);
      }
    });
    request.current = { controller, result };
    return result;
  }

  const analyzeAfterTyping = useEffectEvent(() => { void analyze(); });
  useEffect(() => {
    if (composing || loadingPreferences || submitting || preferences.analyzed || excess
      || text.trim().length < 5 || attemptedPrompt.current === text) return;
    const timer = window.setTimeout(() => analyzeAfterTyping(), 900);
    return () => window.clearTimeout(timer);
  }, [composing, excess, loadingPreferences, preferences.analyzed, submitting, text, draft.tripId]);

  function updateChip(group: ChipGroup, label: string, remove: boolean) {
    const field = group === "pace" ? paceChoices.find((choice) => choice.label === label)?.field : undefined;
    const replacedLabels = new Set<string>(paceChoices.filter((choice) => choice.field === field).map((choice) => choice.label));
    const selected = remove
      ? preferences[group].filter((value) => value !== label)
      : [...preferences[group].filter((value) => !replacedLabels.has(value)), label];
    const profile = preferences.apiProfile;
    const apiProfile = profile ? updateProfile(profile, group, label, remove, selected) : undefined;
    if (apiProfile && apiProfile.notes.length > 5) {
      setAnalysisError("여행 취향 메모는 최대 5개까지 저장할 수 있어요.");
      return;
    }
    setAnalysisError("");
    onChange({ ...draft, preferences: { ...preferences, [group]: selected, apiProfile } });
  }

  async function submit() {
    if (submission.current || excess || loadingPreferences || composing) return;
    submission.current = true;
    setSubmitting(true);
    setAnalysisError("");
    try {
      const analyzed = preferences.analyzed ? preferences : await analyze();
      if (!analyzed) return;
      if (live && analyzed.apiProfile) {
        await savePreferences(Number(draft.tripId), { ...analyzed.apiProfile, rawText: analyzed.text });
      }
      await onGenerate({ ...draft, preferences: analyzed });
    } catch (reason) {
      setAnalysisError(reason instanceof Error ? reason.message : "여행 취향을 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      submission.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
      <P.Preferences>
        <div>
          <P.AiBadge><img src={promptAi} alt="" />도틀로 AI</P.AiBadge>
          <S.Title>어떤 여행을 원하세요?</S.Title>
          <S.Subtitle>편하게 말해주면 AI가 코스에 맞게 정리해요</S.Subtitle>
        </div>
        <P.Prompt $active={Boolean(text)} $exceeded={excess > 0}>
          <textarea
            aria-label="원하는 여행"
            aria-invalid={excess > 0}
            aria-describedby={excess > 0 ? "ai-prompt-error" : undefined}
            placeholder="예) 맛집 위주로 먹고 싶고, 밤에는 야경도 보고 싶어요"
            value={text}
            readOnly={submitting}
            onChange={(event) => changeText(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
          <span><b>{text.length}</b> / {promptLimit}</span>
        </P.Prompt>
        {excess > 0 && (
          <P.PromptError id="ai-prompt-error" role="status">
            {promptLimit}자까지 입력할 수 있어요. {excess}자를 줄여주세요
          </P.PromptError>
        )}
        {excess === 0 && (busy || preferences.analyzed ? (
          <P.Analysis>
            <header>
              <img src={sparkle} alt="" />
              {busy ? <P.AnalysisStatus role="status">여행 취향을 분석하고 있어요</P.AnalysisStatus> : "AI가 이렇게 이해했어요"}
            </header>
            {!busy && chipGroups.map(({ key, title, options }) => {
              const available = options.filter((label) => !preferences[key].includes(label));
              return (
                <section key={key}>
                  <span>{title}</span>
                  <S.Chips>
                    {preferences[key].map((value, index) => (
                      <P.AnalysisChip key={value}>
                        {key === "tastes" && <P.TasteNumber>{index + 1}</P.TasteNumber>}
                        {value}
                        <button type="button" aria-label={value + " 삭제"} disabled={submitting} onClick={() => updateChip(key, value, true)}>
                          <img src={removeChip} alt="" />
                        </button>
                      </P.AnalysisChip>
                    ))}
                    {available.length > 0 && (
                      <P.ChipChoice>
                        <img src={addChip} alt="" />추가
                        <select aria-label={title + " 추가"} value="" disabled={submitting} onChange={(event) => updateChip(key, event.target.value, false)}>
                          <option value="" disabled>{title} 추가</option>
                          {available.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </P.ChipChoice>
                    )}
                  </S.Chips>
                </section>
              );
            })}
          </P.Analysis>
        ) : (
          <div>
            <P.ExampleTitle>이런 여행은 어때요</P.ExampleTitle>
            <P.Examples>
              {examples.map(({ text: label, sentence, icon }) => (
                <P.Example
                  type="button"
                  key={label}
                  disabled={submitting}
                  onClick={() => changeText([text.trimEnd(), sentence].filter(Boolean).join("\n"))}
                >
                  <span><img src={icon} alt="" /></span>
                  {label}
                  <img src={add} alt="" />
                </P.Example>
              ))}
            </P.Examples>
          </div>
        ))}
      </P.Preferences>
      <S.Footer>
        {(error || analysisError) && <S.ErrorText role="alert">{error || analysisError}</S.ErrorText>}
        <P.MakeCourse
          type="button"
          disabled={loadingPreferences || submitting || composing || (!text.trim() && !preferences.analyzed) || excess > 0}
          onClick={() => void submit()}
        >
          코스 만들기
        </P.MakeCourse>
      </S.Footer>
    </>
  );
}

export default PreferencesStep;
