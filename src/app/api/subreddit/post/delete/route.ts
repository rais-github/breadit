import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    // Get the session to verify the user is logged in
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const postId = params.postId;

    // Find the post by ID
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // Check if the logged-in user is the author of the post
    if (post.authorId !== session.user.id) {
      return new Response("You are not authorized to delete this post", {
        status: 403,
      });
    }

    // Delete the post
    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return new Response("Post deleted successfully", { status: 200 });
  } catch (error) {
    return new Response(
      "An error occurred while deleting the post. Please try again later.",
      { status: 500 }
    );
  }
}
