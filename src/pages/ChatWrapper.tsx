import { useParams, useLocation } from "react-router-dom";
import Chat from "./Chat";

export default function ChatWrapper() {
  const { matchId } = useParams();
  const location = useLocation();
  const otherUserName = location.state?.otherUserName || "User";

  return <Chat matchId={matchId!} otherUserName={otherUserName} />;
}
