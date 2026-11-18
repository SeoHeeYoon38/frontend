import aiAvatar from "../../assets/course-community/ai-avatar.png";
import { chatActions, type ChatAction } from "../../utils/chatActions";

export default function ChatPendingBubble({ action }: { action: ChatAction }) {
  return (
    <article className="community-chat__ai-message" role="status">
      <img className="community-chat__ai-avatar" src={aiAvatar} alt="" />
      <div>
        <strong>도틀로 AI</strong>
        <div className="community-chat__ai-bubble community-chat__ai-bubble--loading">
          <p>{chatActions.find(({ id }) => id === action)?.loading}</p>
        </div>
      </div>
    </article>
  );
}
