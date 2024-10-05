"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC, useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  votesAmt: number;
  subredditName: string;
  currentVote?: PartialVote;
  commentAmt: number;
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return; // If the user cancels, exit the function early
    }

    try {
      const response = await fetch(
        `/api/subreddit/post/delete/${post.id}`, // corrected URL structure
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Post deleted successfully");
        return toast({
          title: "Delete",
          description: "Post removed.",
          variant: "default",
        });

        window.location.reload();
      } else {
        console.error("Failed to delete post");
        return toast({
          title: "Delete",
          description: "Failed to delete post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      return toast({
        title: "Error",
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500 flex justify-between items-center">
            <div>
              {subredditName ? (
                <>
                  <a
                    className="underline text-zinc-900 text-sm underline-offset-2"
                    href={`/r/${subredditName}`}
                  >
                    r/{subredditName}
                  </a>
                  <span className="px-1">•</span>
                </>
              ) : null}
              <span>Posted by u/{post.author.username}</span>{" "}
              <em>{formatTimeToNow(new Date(post.createdAt))}</em>
            </div>

            {/* Trash2 button with delete functionality */}
            <a onClick={handleDelete} className="ml-2 cursor-pointer">
              <Trash2 size={28} strokeWidth={2.75} />
            </a>
          </div>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              <strong>{post.title}</strong>
            </h1>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6">
        <Link
          href={`/r/${subredditName}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" /> {commentAmt} comments
        </Link>
      </div>
    </div>
  );
};

export default Post;
