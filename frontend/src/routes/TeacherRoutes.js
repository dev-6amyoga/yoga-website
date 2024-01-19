import TeacherHome from "../pages/teacher/TeacherHome";
import InvitePage from "../pages/teacher/invite/Index";
import TeacherPlaylist from "../pages/teacher/TeacherPlaylist";
import SelfAudioUpload from "../pages/teacher/SelfAudioUpload";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
export const TeacherRoutes = [
  {
    path: "/teacher",
    element: <TeacherHome />,
  },
  {
    path: "/teacher/invite",
    element: <InvitePage />,
  },
  {
    path: "/teacher/playlist",
    element: <TeacherPlaylist />,
  },
  {
    path: "/teacher/self-audio-upload",
    element: <SelfAudioUpload />,
  },
  {
    path: "/teacher/make-playlist",
    element: <TeacherPlaylistCreation />,
  },
];
