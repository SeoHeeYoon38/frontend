import type { ReactNode } from "react";
import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import * as S from "./Layout.styled";
interface LayoutProps {
  variant?: "home" | "courses" | "trip" | "myTrips";
  children?: ReactNode;
  step?: number;
  onBack?: () => void;
  hideProgress?: boolean;
}

function Layout({
  variant = "home",
  children,
  step = 1,
  onBack,
  hideProgress = false,
}: LayoutProps) {
  const isCourses = variant === "courses";
  const isTrip = variant === "trip";
  const hasBottomNav = variant === "home" || variant === "myTrips";
  return (
    <S.Shell $courses={isCourses || isTrip} $trip={isTrip}>
      <Header
        variant={variant}
        step={step}
        onBack={onBack}
        hideProgress={hideProgress}
      />
      <S.Content
        $courses={isCourses}
        $trip={isTrip}
        $myTrips={variant === "myTrips"}
      >
        {children ?? <Outlet />}
      </S.Content>
      {hasBottomNav && <Footer />}
    </S.Shell>
  );
}
export default Layout;
