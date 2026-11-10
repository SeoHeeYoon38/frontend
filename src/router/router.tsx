import { createBrowserRouter } from "react-router";
import App from "../App";
import Layout from "../components/common/Layout";
import HomePage from "../pages/HomePage";
import { routes } from "../config/routes";

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <App />,
    hydrateFallbackElement: <></>,
    children: [
      {
        element: <Layout />,
        children: [{ index: true, element: <HomePage /> }],
      },
      {
        path: routes.notifications,
        lazy: async () => ({
          Component: (await import("../pages/NotificationsPage")).default,
        }),
      },
      {
        element: <Layout variant="myTrips" />,
        children: [
          {
            path: routes.myTrips,
            lazy: async () => ({
              Component: (await import("../pages/MyTripsPage")).default,
            }),
          },
        ],
      },
      {
        element: <Layout variant="my" />,
        children: [
          {
            path: routes.my,
            lazy: async () => ({
              Component: (await import("../pages/MyPage")).default,
            }),
          },
        ],
      },
      {
        path: routes.savedItems,
        lazy: async () => ({
          Component: (await import("../pages/SavedItemsPage")).default,
        }),
      },
      {
        element: <Layout variant="courses" />,
        children: [
          {
            path: routes.courses,
            lazy: async () => ({
              Component: (await import("../pages/CoursesPage")).default,
            }),
          },
        ],
      },
      {
        path: routes.courseDetail,
        lazy: async () => ({
          Component: (await import("../pages/TravelerCoursePage")).default,
        }),
      },
      {
        path: routes.createTrip,
        lazy: async () => ({
          Component: (await import("../pages/TripCreatePage")).default,
        }),
      },
      {
        path: routes.tripPlan,
        lazy: async () => ({
          Component: (await import("../pages/TripPlanPage")).default,
        }),
      },
      {
        path: routes.tripSettings,
        lazy: async () => ({
          Component: (await import("../pages/CourseSettingsPage")).default,
        }),
      },
      {
        path: routes.tripCommunity,
        lazy: async () => ({
          Component: (await import("../pages/CourseCommunityPage")).default,
        }),
      },
    ],
  },
]);

export default router;
