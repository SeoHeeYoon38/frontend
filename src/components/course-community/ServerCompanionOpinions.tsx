import { useRef, useState } from "react";
import { addItemComment, deleteItemComment, setCommentLike, setItemLike, type TripInteractions } from "../../api/interactions";
import { appendComment, canDeleteComment, commentInputValid, removeComment } from "../../utils/tripInteractions";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import heartIcon from "../../assets/figma/opinion-like.svg";
import commentHeartIcon from "../../assets/figma/opinion-comment-like.svg";
import heartFilledIcon from "../../assets/figma/opinion-comment-like-filled.svg";
import "./CourseCommunity.css";

interface Props {
  tripId: number;
  itemId: string;
  interactions?: TripInteractions;
  loadError?: string;
  onRefresh: () => Promise<void>;
  currentUserId?: number;
  onChange: (update: (current: TripInteractions) => TripInteractions) => void;
}

function avatarFor(characterId: number | null) {
  return characterId === 2 ? avatarPurple : characterId === 3 ? avatarYellow : avatarBlue;
}

export default function ServerCompanionOpinions({ tripId, itemId, interactions, loadError, onRefresh, currentUserId, onChange }: Props) {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [syncFailed, setSyncFailed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number>();
  const inFlight = useRef(false);
  const summary = interactions?.items.find((item) => item.itemId === itemId);
  const comments = interactions?.comments.filter((item) => item.itemId === itemId) ?? [];
  const replyTarget = comments.find((item) => item.id === replyTo);
  const replyAuthor = replyTarget?.author.nickname;

  const run = async (action: () => Promise<unknown>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await action();
      try {
        await onRefresh();
        setSyncFailed(false);
      } catch {
        setSyncFailed(true);
        setError("요청은 완료됐지만 최신 의견을 불러오지 못했어요. 다시 조회해 주세요.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "의견을 반영하지 못했어요.");
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  };

  return (
    <section className="companion-opinions" aria-labelledby="companion-opinions-title">
      <header className="companion-opinions__header">
        <h2 id="companion-opinions-title">일행 의견 <span>{interactions ? comments.length : ""}</span></h2>
        {summary && <button className={summary.liked ? "is-liked" : ""} type="button"
          aria-pressed={summary.liked} disabled={pending || syncFailed}
          onClick={() => void run(async () => {
            const result = await setItemLike(tripId, itemId, !summary.liked);
            onChange((current) => ({ ...current, items: current.items.map((item) => item.itemId === itemId
              ? { ...item, likeCount: result.count, liked: result.liked } : item) }));
          })}>
          <img src={summary.liked ? heartFilledIcon : heartIcon} alt="" /> 좋아요 {summary.likeCount}
        </button>}
      </header>
      {!interactions && !loadError && <p role="status">일행 의견을 불러오고 있어요.</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {error && <p role="alert">{error}</p>}
      {(loadError || syncFailed) && <button type="button" disabled={pending} onClick={() => void run(async () => {})}>의견 다시 조회</button>}
      {interactions && !summary && <p>현재 일정에 없는 방문 장소예요. 일정으로 돌아가 다시 확인해 주세요.</p>}
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
                <button className={comment.liked ? "is-liked" : ""} type="button" disabled={pending || syncFailed || !summary}
                  aria-label={`${comment.author.nickname}님의 의견 좋아요`} aria-pressed={comment.liked}
                  onClick={() => void run(async () => {
                    const result = await setCommentLike(comment.id, !comment.liked);
                    onChange((current) => ({ ...current, comments: current.comments.map((item) => item.id === comment.id
                      ? { ...item, likeCount: result.count, liked: result.liked } : item) }));
                  })}>
                  <img src={comment.liked ? heartFilledIcon : commentHeartIcon} alt="" /> <span>{comment.likeCount}</span>
                </button>
                <button type="button" disabled={pending || syncFailed || !summary}
                  onClick={() => setReplyTo(comment.parentId ?? comment.id)}>답글 달기</button>
                {canDeleteComment(comment, currentUserId) && <button type="button"
                  disabled={pending || syncFailed || !summary} onClick={() => setDeleteTarget(comment.id)}>삭제</button>}
                {deleteTarget === comment.id && <div role="group" aria-label="댓글 삭제 확인">
                  <p>{comment.parentId === null ? "댓글과 달린 답글을 삭제할까요?" : "답글을 삭제할까요?"}</p>
                  <button type="button" disabled={pending || syncFailed} onClick={() => void run(async () => {
                    if (!canDeleteComment(comment, currentUserId)) return;
                    await deleteItemComment(comment.id);
                    onChange((current) => removeComment(current, comment.id));
                    if (replyTo === comment.id || comments.find((item) => item.id === replyTo)?.parentId === comment.id) setReplyTo(null);
                    setDeleteTarget(undefined);
                  })}>삭제 확인</button>
                  <button type="button" disabled={pending} onClick={() => setDeleteTarget(undefined)}>취소</button>
                </div>}
              </div>
            </div>
          </article>;
        })}
      </div>
      <form className="companion-composer" onSubmit={(event) => {
        event.preventDefault();
        const content = message.trim();
        if (!commentInputValid(content) || !summary || syncFailed) return;
        if (replyTo !== null && !replyTarget) {
          setReplyTo(null);
          setError("답글 대상이 사라졌어요. 댓글을 다시 확인해 주세요.");
          return;
        }
        void run(async () => {
          const comment = await addItemComment(tripId, itemId, content, replyTarget?.parentId ?? replyTo);
          onChange((current) => appendComment(current, comment));
          setMessage("");
          setReplyTo(null);
        });
      }}>
        <img src={avatarBlue} alt="" />
        <label>
          <span className="course-community__sr-only">일행에게 의견 남기기</span>
          <input value={message} maxLength={500} disabled={!summary || pending || syncFailed}
            placeholder={replyAuthor ? `@${replyAuthor}에게 답글 남기기` : "일행에게 의견을 남겨보세요"}
            onChange={(event) => setMessage(event.target.value)} />
          <button type="submit" disabled={!commentInputValid(message) || !summary || pending || syncFailed} aria-label="의견 보내기">
            <span aria-hidden="true" />
          </button>
        </label>
      </form>
      {replyTo !== null && <button type="button" disabled={pending} onClick={() => setReplyTo(null)}>답글 취소</button>}
    </section>
  );
}
