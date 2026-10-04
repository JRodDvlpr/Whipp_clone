import { Navigate, Outlet, RouterProvider, createHashRouter, useLocation, useRouteError } from 'react-router-dom';
import { useEffect } from 'react';
import { useHydrated } from './state/hooks';
import { useApp } from './state/store';
import { TabBar } from './ui/primitives';
import { Cook } from './screens/Cook';
import { Discover, Favorites } from './screens/Discover';
import { GroceryList } from './screens/GroceryList';
import { Onboarding } from './screens/onboarding/Onboarding';
import { Plan } from './screens/Plan';
import { Plans } from './screens/Plans';
import { Profile, ProfileEdit } from './screens/Profile';
import { Recipe } from './screens/Recipe';
import { Planning, Welcome } from './screens/Welcome';

function ScrollTop() {
  const { pathname } = useLocation();
  // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Sends first-time users to onboarding and everyone else into the app. */
function Gate({ need }: { need: 'onboarded' | 'new' }) {
  const onboarded = useApp((s) => s.onboarded);
  if (need === 'onboarded' && !onboarded) return <Navigate to="/welcome" replace />;
  if (need === 'new' && onboarded) return <Navigate to="/plan" replace />;
  return (
    <>
      <ScrollTop />
      <Outlet />
    </>
  );
}

/** Friendly fallback instead of React Router's developer error page. */
function ErrorScreen() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="loader">
      <div style={{ fontSize: 56 }}>🍳</div>
      <h1 className="title-lg">Something went wrong</h1>
      <p className="muted">Your plans are safe on this device. Reloading usually fixes it.</p>
      <button className="btn btn-lime" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
}

function Tabs() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
}

const router = createHashRouter([
  {
    element: <Gate need="new" />,
    errorElement: <ErrorScreen />,
    children: [
      { path: '/welcome', element: <Welcome /> },
      { path: '/onboarding/:step', element: <Onboarding /> },
      { path: '/planning', element: <Planning /> },
    ],
  },
  {
    element: <Gate need="onboarded" />,
    errorElement: <ErrorScreen />,
    children: [
      {
        element: <Tabs />,
        children: [
          { path: '/plan', element: <Plan /> },
          { path: '/discover', element: <Discover /> },
          { path: '/favorites', element: <Favorites /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
      { path: '/plans', element: <Plans /> },
      { path: '/list/:week', element: <GroceryList /> },
      { path: '/recipe/:id', element: <Recipe /> },
      { path: '/cook/:id', element: <Cook /> },
      { path: '/profile/edit/:section', element: <ProfileEdit /> },
    ],
  },
  { path: '*', element: <Navigate to="/plan" replace /> },
]);

export default function App() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <RouterProvider router={router} />;
}
