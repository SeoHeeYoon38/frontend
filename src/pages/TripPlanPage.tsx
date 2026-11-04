import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { routes } from '../config/routes'
import heroPhoto from '../assets/course-completion/hero-photo.png'
import aiAvatar from '../assets/course-completion/ai-avatar.png'
import routeMap from '../assets/course-completion/route-map.png'
import placeAirport from '../assets/course-completion/place-airport.png'
import placeHotel from '../assets/course-completion/place-hotel.png'
import placeMarket from '../assets/course-completion/place-market.png'
import placeCoffee from '../assets/course-completion/place-coffee.png'
import placeDotonbori from '../assets/course-completion/place-dotonbori.png'
import calendarIcon from '../assets/course-completion/icon-calendar.svg'
import pinIcon from '../assets/course-completion/icon-pin.svg'
import trainIcon from '../assets/course-completion/icon-train.svg'
import routeLine1 from '../assets/course-completion/route-line-1.svg'
import routeLine2 from '../assets/course-completion/route-line-2.svg'
import routeLine3 from '../assets/course-completion/route-line-3.svg'
import routeLine4 from '../assets/course-completion/route-line-4.svg'
import routeLine5 from '../assets/course-completion/route-line-5.svg'
import dragHandleIcon from '../assets/course-completion/drag-handle.svg'
import airportIcon from '../assets/course-completion/category-airport.svg'
import hotelIcon from '../assets/course-completion/category-hotel.svg'
import foodIcon from '../assets/course-completion/category-food.svg'
import cafeIcon from '../assets/course-completion/category-cafe.svg'
import removeIcon from '../assets/course-completion/remove.svg'
import triangleIcon from '../assets/course-completion/triangle-down.svg'
import statusIcons from '../assets/course-completion/status-icons.svg'
import backIcon from '../assets/course-completion/back.svg'
import settingsIcon from '../assets/course-completion/settings.svg'
import '../styles/course-completion.css'

type Place = {
  id: number
  name: string
  category: string
  detail: string
  image: string
  icon: string
  travel?: string
  distance?: string
  travelTone?: 'walk' | 'transit'
}

const days = [
  { label: '1일차', date: '5.18' },
  { label: '2일차', date: '5.19' },
  { label: '3일차', date: '5.20' },
  { label: '4일차', date: '5.21' },
]

const initialPlaces: Place[] = [
  {
    id: 1,
    name: '간사이 공항 도착',
    category: '항공',
    detail: 'KE723, 대한항공',
    image: placeAirport,
    icon: airportIcon,
    travel: '도보 18분',
    distance: '1.2km',
    travelTone: 'walk',
  },
  {
    id: 2,
    name: 'APA 호텔 난바',
    category: '숙소',
    detail: '체크인 15:00',
    image: placeHotel,
    icon: hotelIcon,
    travel: '도보 5분',
    distance: '300m',
    travelTone: 'walk',
  },
  {
    id: 3,
    name: '구로몬 시장',
    category: '맛집',
    detail: '영업 중 09:00~18:00',
    image: placeMarket,
    icon: foodIcon,
    travel: '대중교통 8분',
    distance: '1.6km',
    travelTone: 'transit',
  },
  {
    id: 4,
    name: '리로 커피 로스터스',
    category: '카페',
    detail: '영업 중 09:00~18:00',
    image: placeCoffee,
    icon: cafeIcon,
    travel: '도보 6분',
    distance: '400m',
    travelTone: 'walk',
  },
  {
    id: 5,
    name: '도톤보리 저녁 식사',
    category: '맛집',
    detail: '영업 중 09:00~18:00',
    image: placeDotonbori,
    icon: foodIcon,
  },
]

function RouteMap() {
  return (
    <div className="course-map" aria-label="1일차 이동 경로 지도">
      <img className="course-map__base" src={routeMap} alt="오사카 여행 경로 지도" />
      {[routeLine1, routeLine2, routeLine3, routeLine4, routeLine5].map((line, index) => (
        <img className={`course-map__line course-map__line--${index + 1}`} src={line} alt="" key={line} />
      ))}
      {[
        [1, '25.69%', '8.33%'],
        [2, '45.58%', '19.32%'],
        [3, '30.66%', '41.67%'],
        [4, '28.73%', '66.67%'],
        [5, '47.51%', '68.56%'],
        [6, '42.27%', '78.03%'],
      ].map(([number, left, top]) => (
        <span className="course-map__pin" style={{ left, top }} key={number}>
          {number}
        </span>
      ))}
    </div>
  )
}

function PlaceTimeline({ places, onRemove }: { places: Place[]; onRemove: (id: number) => void }) {
  return (
    <div className="place-timeline">
      {places.map((place, index) => (
        <div className="place-stop" key={place.id}>
          <div className="place-stop__rail" aria-hidden="true">
            <span className="place-stop__rail-before" />
            <span className="place-stop__order">{index + 1}</span>
            <span className={`place-stop__rail-after ${index === places.length - 1 ? 'is-last' : ''}`} />
          </div>
          <div className="place-stop__content">
            <article className="place-card">
              <img className="place-card__handle" src={dragHandleIcon} alt="순서 변경" />
              <img className="place-card__thumbnail" src={place.image} alt="" />
              <div className="place-card__copy">
                <strong>{place.name}</strong>
                <div className="place-card__meta">
                  <img src={place.icon} alt="" />
                  <b>{place.category}</b>
                  <span className="place-card__divider" />
                  <span>{place.detail}</span>
                </div>
              </div>
              <button className="place-card__remove" type="button" onClick={() => onRemove(place.id)} aria-label={`${place.name} 삭제`}>
                <img src={removeIcon} alt="" />
              </button>
            </article>
            {place.travel && (
              <div className="place-move">
                <span className={`place-move__pill place-move__pill--${place.travelTone}`}>
                  {place.travel}
                  <img src={triangleIcon} alt="" />
                </span>
                <span>{place.distance}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TripPlanPage() {
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(0)
  const [places, setPlaces] = useState(initialPlaces)
  const [notice, setNotice] = useState('')
  const removedPlace = useMemo(() => initialPlaces.find((place) => !places.some((item) => item.id === place.id)), [places])

  const handleAddPlace = () => {
    if (!removedPlace) {
      setNotice('모든 장소가 일정에 포함되어 있어요.')
      return
    }

    setPlaces((current) => [...current, removedPlace])
    setNotice(`${removedPlace.name}을(를) 다시 추가했어요.`)
  }

  return (
    <div className="course-page-shell">
      <main className="course-page">
        <header className="course-hero">
          <img className="course-hero__photo" src={heroPhoto} alt="오사카 거리 풍경" />
          <div className="course-hero__scrim" />
          <div className="course-statusbar" aria-hidden="true">
            <span>9:41</span>
            <img src={statusIcons} alt="" />
          </div>
          <nav className="course-navigation" aria-label="코스 화면 탐색">
            <button type="button" aria-label="뒤로 가기">
              <img src={backIcon} alt="" />
            </button>
            <strong>AI 여행 코스</strong>
            <button type="button" aria-label="설정 열기" onClick={() => navigate(routes.tripSettings)}>
              <img src={settingsIcon} alt="" />
            </button>
          </nav>
          <div className="course-hero__title">
            <span>오사카</span>
            <h1>오사카 3박 4일</h1>
            <p>2026.05.18 (월) - 05.21 (목)</p>
          </div>
        </header>

        <div className="course-content">
          <section className="ai-summary" aria-label="도틀로 AI 일정 구성 설명">
            <img src={aiAvatar} alt="도틀로 AI" />
            <div className="ai-summary__bubble">
              <b>도틀로 AI의 일정 구성</b>
              <p>부모님과 함께하는 여행을 고려해<br />덜 걷고 여유롭게 구성했어요</p>
            </div>
          </section>

          <section className="course-section">
            <h2>일정</h2>
            <div className="course-facts">
              <div className="course-fact">
                <img src={calendarIcon} alt="" />
                <strong>2박 3일</strong>
                <span>여행 기간</span>
              </div>
              <div className="course-fact">
                <img src={pinIcon} alt="" />
                <strong>12곳</strong>
                <span>장소</span>
              </div>
              <div className="course-fact">
                <img src={trainIcon} alt="" />
                <strong>도보와 버스</strong>
                <span>이동 방법</span>
              </div>
            </div>

            <div className="course-tabs" role="tablist" aria-label="여행 일차">
              {days.map((day, index) => (
                <button
                  className={activeDay === index ? 'is-active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeDay === index}
                  onClick={() => setActiveDay(index)}
                  key={day.label}
                >
                  <strong>{day.label}</strong>
                  <span>{day.date}</span>
                </button>
              ))}
            </div>
            <RouteMap />
          </section>

          <section className="day-course">
            <div className="day-course__header">
              <h2>천천히 즐기는 미식과 야경</h2>
              <p><span>{places.length}곳</span><i /><span>도보 1.1km</span></p>
            </div>
            <PlaceTimeline places={places} onRemove={(id) => setPlaces((current) => current.filter((place) => place.id !== id))} />
            <button className="add-place-button" type="button" onClick={handleAddPlace}>
              <span aria-hidden="true">＋</span> 장소 추가
            </button>
          </section>
        </div>

        <div className="course-cta">
          <button type="button" onClick={() => setNotice('AI 수정 요청 화면은 다음 단계에서 연결할 수 있어요.')}>AI 수정 요청</button>
        </div>
        <p className="course-live-region" aria-live="polite">{notice}</p>
      </main>
    </div>
  )
}

export default TripPlanPage
