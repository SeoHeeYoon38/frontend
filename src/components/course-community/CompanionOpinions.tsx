import { useMemo, useRef, useState } from "react";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import heartIcon from "../../assets/figma/opinion-like.svg";
import commentHeartIcon from "../../assets/figma/opinion-comment-like.svg";
import heartFilledIcon from "../../assets/figma/opinion-comment-like-filled.svg";
import closeIcon from "../../assets/place-import/link-clear.svg";
import { initialCompanionComments } from "../../data/mocks/courseCommunityData";
import type { CompanionComment } from "../../types/courseCommunity";
import "./CourseCommunity.css";

function CompanionOpinions({ placeName }: { placeName: string }) {
  const [comments, setComments] = useState<CompanionComment[]>(
    placeName === "구로몬 시장" ? initialCompanionComments : [],
  );
  const [placeLiked, setPlaceLiked] = useState(placeName === "구로몬 시장");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const composer = useRef<HTMLInputElement>(null);

  const placeLikes = useMemo(() => (placeLiked ? 1 : 0), [placeLiked]);

  const toggleCommentLike = (id: number) => {
    setComments((current) =>
      current.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.likes + (comment.liked ? -1 : 1),
            }
          : comment,
      ),
    );
  };

  const submitComment = () => {
    const nextMessage = message.trim();
    if (!nextMessage) return;

    setComments((current) => [
      ...current,
      {
        id: Date.now(),
        author: "우예빈",
        avatar: avatarBlue,
        message: nextMessage,
        time: "방금 전",
        likes: 0,
        liked: false,
        replyTo: replyTo ?? undefined,
      },
    ]);
    setMessage("");
    setReplyTo(null);
  };

  return (
    <section className="companion-opinions" aria-labelledby="companion-opinions-title">
      <header className="companion-opinions__header">
        <h2 id="companion-opinions-title">
          일행 의견 <span>{comments.length}</span>
        </h2>
        <button
          className={placeLiked ? "is-liked" : ""}
          type="button"
          aria-pressed={placeLiked}
          onClick={() => setPlaceLiked((current) => !current)}
        >
          <img src={placeLiked ? heartFilledIcon : heartIcon} alt="" /> 좋아요 {placeLikes}
        </button>
      </header>

      <div className="companion-opinions__thread">
        {comments.map((comment) => (
          <article
            className={comment.replyTo ? "companion-comment is-reply" : "companion-comment"}
            key={comment.id}
          >
            {comment.replyTo && <span className="companion-comment__thread-line" aria-hidden="true" />}
            <img src={comment.avatar} alt="" />
            <div>
              <p className="companion-comment__meta">
                <strong>{comment.author}</strong>
                <span>{comment.time}</span>
              </p>
              <p className="companion-comment__bubble">
                {comment.replyTo && <b>@{comment.replyTo} </b>}
                {comment.message}
              </p>
              <div className="companion-comment__actions">
                <button
                  className={comment.liked ? "is-liked" : ""}
                  type="button"
                  aria-label={`${comment.author}님의 의견 좋아요`}
                  aria-pressed={comment.liked}
                  onClick={() => toggleCommentLike(comment.id)}
                >
                  <img src={comment.liked ? heartFilledIcon : commentHeartIcon} alt="" /> <span>{comment.likes}</span>
                </button>
                <button type="button" onClick={() => { setReplyTo(comment.author); composer.current?.focus(); }}>
                  답글 달기
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="companion-composer-frame">
        {replyTo && (
          <div className="companion-reply-target">
            <span><strong>{replyTo}</strong>님에게 답글 남기는 중</span>
            <button type="button" aria-label="답글 취소" onClick={() => setReplyTo(null)}>
              <img src={closeIcon} alt="" />
            </button>
          </div>
        )}
        <form
          className="companion-composer"
          onSubmit={(event) => {
            event.preventDefault();
            submitComment();
          }}
        >
          <img src={avatarBlue} alt="" />
          <label>
            <span className="course-community__sr-only">일행에게 의견 남기기</span>
            {replyTo && <strong className="companion-reply-mention" aria-hidden="true">@{replyTo}</strong>}
            <input
              ref={composer}
              value={message}
              placeholder={replyTo ? `@${replyTo}에게 답글 남기기` : "일행에게 의견을 남겨보세요"}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit" disabled={!message.trim()} aria-label="의견 보내기">
              <span aria-hidden="true" />
            </button>
          </label>
        </form>
      </div>
    </section>
  );
}

export default CompanionOpinions;
