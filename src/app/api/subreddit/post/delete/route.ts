import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Handling DELETE method
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId"); // extract the postId from the URL

  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    // Find the post by ID
    const post = await db.post.findUnique({
      where: {
        id: postId || "",
      },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json("You are not authorized to delete this post", {
        status: 403,
      });
    }

    // Delete the post
    await db.post.delete({
      where: {
        id: postId || "",
      },
    });

    return NextResponse.json("Post deleted successfully", { status: 200 });
  } catch (error) {
    return NextResponse.json("Failed to delete post.", { status: 500 });
  }
}
