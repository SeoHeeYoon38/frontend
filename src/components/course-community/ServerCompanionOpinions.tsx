import { useState } from "react";
import { addItemComment, setCommentLike, setItemLike, type TripInteractions } from "../../api/interactions";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import heartIcon from "../../assets/figma/traveler-heart.svg";
import heartFilledIcon from "../../assets/figma/traveler-heart-filled.svg";
import "./CourseCommunity.css";

interface Props {
  tripId: number;
  itemId: string;
  interactions?: TripInteractions;
  loadError?: string;
  onRefresh: () => Promise<void>;
}

function avatarFor(characterId: number | null) {
  return characterId === 2 ? avatarPurple : characterId === 3 ? avatarYellow : avatarBlue;
}

export default function ServerCompanionOpinions({ tripId, itemId, interactions, loadError, onRefresh }: Props) {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const summary = interactions?.items.find((item) => item.itemId === itemId);
  const comments = interactions?.comments.filter((item) => item.itemId === itemId) ?? [];
  const replyAuthor = comments.find((item) => item.id === replyTo)?.author.nickname;

  const run = async (action: () => Promise<unknown>) => {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await action();
      await onRefresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "의견을 반영하지 못했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="companion-opinions" aria-labelledby="companion-opinions-title">
      <header className="companion-opinions__header">
        <h2 id="companion-opinions-title">일행 의견 <span>{interactions ? comments.length : ""}</span></h2>
        {summary && <button className={summary.liked ? "is-liked" : ""} type="button"
          aria-pressed={summary.liked} disabled={pending}
          onClick={() => void run(() => setItemLike(tripId, itemId, !summary.liked))}>
          <img src={summary.liked ? heartFilledIcon : heartIcon} alt="" /> 좋아요 {summary.likeCount}
        </button>}
      </header>
      {!interactions && !loadError && <p role="status">일행 의견을 불러오고 있어요.</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {error && <p role="alert">{error}</p>}
      <div className="companion-opinions__thread">
        {comments.map((comment) => {
          const parentName = comments.find((item) => item.id === comment.parentId)?.author.nickname;
          return <article className={comment.parentId ? "companion-comment is-reply" : "companion-comment"} key={comment.id}>
            {comment.parentId && <span className="companion-comment__thread-line" aria-hidden="true" />}
            <img src={avatarFor(comment.author.characterId)} alt="" />
            <div>
              <p className="companion-comment__meta">
                <strong>{comment.author.nickname}</strong>
                <span>{new Date(comment.createdAt).toLocaleString("ko-KR")}</span>
              </p>
              <p className="companion-comment__bubble">
                {parentName && <b>@{parentName} </b>}{comment.content}
              </p>
              <div className="companion-comment__actions">
                <button className={comment.liked ? "is-liked" : ""} type="button" disabled={pending}
                  aria-label={`${comment.author.nickname}님의 의견 좋아요`} aria-pressed={comment.liked}
                  onClick={() => void run(() => setCommentLike(comment.id, !comment.liked))}>
                  <img src={comment.liked ? heartFilledIcon : heartIcon} alt="" /> <span>{comment.likeCount}</span>
                </button>
                <button type="button" onClick={() => setReplyTo(comment.id)}>답글 달기</button>
              </div>
            </div>
          </article>;
        })}
      </div>
      <form className="companion-composer" onSubmit={(event) => {
        event.preventDefault();
        const content = message.trim();
        if (!content || !interactions) return;
        void run(async () => {
          await addItemComment(tripId, itemId, content, replyTo);
          setMessage("");
          setReplyTo(null);
        });
      }}>
        <img src={avatarBlue} alt="" />
        <label>
          <span className="course-community__sr-only">일행에게 의견 남기기</span>
          <input value={message} maxLength={500} disabled={!interactions || pending}
            placeholder={replyAuthor ? `@${replyAuthor}에게 답글 남기기` : "일행에게 의견을 남겨보세요"}
            onChange={(event) => setMessage(event.target.value)} />
          <button type="submit" disabled={!message.trim() || !interactions || pending} aria-label="의견 보내기">
            <span aria-hidden="true" />
          </button>
        </label>
      </form>
    </section>
  );
}
