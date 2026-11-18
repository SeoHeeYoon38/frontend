import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import useTripCreate from "../hooks/useTripCreate";
import Layout from "../components/common/Layout";
import DirectTripBuilder from "../components/direct-trip/DirectTripBuilder";
import TripInfoStep from "../components/trip/TripInfoStep";
import SavedPlacesStep from "../components/trip/SavedPlacesStep";
import ServerSavedPlaces from "../components/trip/ServerSavedPlaces";
import type { PlaceImportView } from "../components/trip/PlaceImportForm";
import PreferencesStep from "../components/trip/PreferencesStep";
import { durationLabel } from "../utils/trip";
import generationIllustration from "../assets/trip-generation-illustration.png";
import generationGlow from "../assets/trip-generation-glow.svg";
import generationDone from "../assets/trip-generation-done.svg";
import generationHalo from "../assets/trip-generation-halo.svg";
import generationNow from "../assets/trip-generation-now.svg";
import generationWait from "../assets/trip-generation-wait.svg";
import { isDirectTripMode } from "../utils/navigation";
import * as S from "./TripCreatePage.styled";
import { isServerTripId, savedPlaceToTripPlace } from "../api/adapters";
import { getSavedPlaces } from "../api/places";
import { getTrip } from "../api/trips";
import { getReservations } from "../api/reservations";
import type { ReservationResponse, TripResponse } from "../api/types";
import { routes } from "../config/routes";
import type { TripPlace } from "../types/trip";
import { isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { tripResourceWarning } from "../utils/tripResources";

function TripCreatePage() {
  const location = useLocation();
  const tripId = new URLSearchParams(location.search).get("tripId");
  if (tripId !== null) {
    return isServerTripId(tripId)
      ? <ResumeTrip key={tripId} tripId={Number(tripId)} />
      : <p role="alert">여행 주소를 확인해 주세요.</p>;
  }
  return isDirectTripMode(location.search) ? <DirectTripBuilder /> : <AiTripCreatePage />;
}

function ResumeTrip({ tripId }: { tripId: number }) {
  const [resumed, setResumed] = useState<{
    trip: TripResponse;
    places?: TripPlace[];
    reservations?: ReservationResponse;
    loadWarning: string;
  }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void getTrip(tripId, signal).then(async (trip) => {
      if (signal.aborted) return;
      const [savedResult, reservationsResult] = await Promise.allSettled([
        getSavedPlaces(tripId, signal),
        getReservations(tripId, signal),
      ]);
      if (!signal.aborted) {
        const saved = savedResult.status === "fulfilled" ? savedResult.value : undefined;
        const reservations = reservationsResult.status === "fulfilled"
          ? reservationsResult.value
          : undefined;
        setResumed({
          trip,
          places: saved?.places.map((place) => savedPlaceToTripPlace(place, trip.city)),
          reservations,
          loadWarning: tripResourceWarning({
            places: savedResult.status === "rejected",
            reservations: reservationsResult.status === "rejected",
          }),
        });
      }
    }).catch(() => { if (!signal.aborted) setError(true); });
    return () => controller.abort();
  }, [tripId]);

  if (resumed) return (
    <AiTripCreatePage
      trip={resumed.trip}
      places={resumed.places}
      reservations={resumed.reservations}
      initialLoadWarning={resumed.loadWarning}
    />
  );

  return (
    <Layout variant="trip" step={1}>
      {error ? (
        <>
          <p role="alert">이어서 만들 여행을 불러오지 못했어요.</p>
          <Link to={routes.home}>홈으로 돌아가기</Link>
        </>
      ) : <p role="status">여행 정보를 불러오고 있어요.</p>}
    </Layout>
  );
}

function AiTripCreatePage({
  trip,
  places,
  reservations,
  initialLoadWarning = "",
}: {
  trip?: TripResponse;
  places?: TripPlace[];
  reservations?: ReservationResponse;
  initialLoadWarning?: string;
}) {
  const [importing, setImporting] = useState(false);
  const [importView, setImportView] = useState<PlaceImportView>("method");
  const {
    draft,
    step,
    generating,
    progress,
    error,
    preparingTrip,
    phases,
    update,
    move,
    back,
    prepareServerTrip,
    startPlacesStep,
    generate,
  } = useTripCreate(trip, places, reservations);

  let content = (
    <TripInfoStep
      draft={draft}
      onChange={update}
      prepareServerTrip={prepareServerTrip}
      onNext={startPlacesStep}
      submitting={preparingTrip}
      submitError={step === 1 ? error : ""}
    />
  );
  if (step === 2)
    content = isApiEnabled() && hasAuthSession() && isServerTripId(draft.tripId) ? (
      <ServerSavedPlaces
        key={draft.tripId}
        tripId={Number(draft.tripId)}
        recommendationCity={draft.city}
        importView={importView}
        onImportViewChange={setImportView}
        onContinue={(saved) => {
          setImportView("method");
          const places = saved.map((place) => savedPlaceToTripPlace(place, draft.city));
          update({
            ...draft,
            places,
            source: "manual",
            selectedPlaceIds: places.filter((place) => place.placeId && !place.closed && !place.needsMatch).map((place) => place.id),
          });
          move(3);
        }}
      />
    ) : (
      <SavedPlacesStep
        draft={draft}
        onChange={update}
        onNext={() => move(3)}
        onLoadingChange={setImporting}
        importView={importView}
        onImportViewChange={setImportView}
      />
    );
  if (step === 3)
    content = (
      <PreferencesStep
        draft={draft}
        onChange={update}
        onGenerate={generate}
        error={error}
      />
    );
  if (generating)
    content = (
      <S.Generation role="status" aria-live="polite">
        <S.GenerationGlow src={generationGlow} alt="" />
        <S.GenerationIllustration src={generationIllustration} alt="일정을 만들고 있는 도틀로 캐릭터" />
        <S.GenerationCopy>
          <h1>
            {draft.city} {durationLabel(draft.startDate, draft.endDate)} 코스를
            <br />
            만들고 있어요
          </h1>
        </S.GenerationCopy>
        <S.GenerationSteps>
          {phases.map((phase, index) => (
            <li key={phase} data-status={index < progress ? "done" : index === progress ? "current" : "waiting"}>
              <span>
                {index === progress && <img className="halo" src={generationHalo} alt="" />}
                <img
                  src={index < progress ? generationDone : index === progress ? generationNow : generationWait}
                  alt={index < progress ? "완료" : index === progress ? "진행 중" : "대기"}
                />
              </span>
              {phase}
            </li>
          ))}
        </S.GenerationSteps>
      </S.Generation>
    );
  return (
    <Layout
      variant="trip"
      step={step}
      onBack={() => {
        if (step === 2 && importView !== "method") {
          setImportView(importView === "file" ? "guide" : "method");
        } else {
          back();
        }
      }}
      hideProgress={generating || importing}
      backDisabled={generating}
      tripGradient={step === 3 && !generating}
    >
      {initialLoadWarning && <S.LoadWarning role="alert">{initialLoadWarning}</S.LoadWarning>}
      {content}
    </Layout>
  );
}
export default TripCreatePage;
