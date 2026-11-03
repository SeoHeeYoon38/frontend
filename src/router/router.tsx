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
        path: routes.createTrip,
        lazy: async () => ({
          Component: (await import("../pages/TripCreatePage")).default,
        }),
      },

    ],
  },
]);
export default router;
