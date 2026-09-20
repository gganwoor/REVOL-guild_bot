import type { ForumChannel, ThreadChannel } from "discord.js";

export async function fetchAllPosts(board: ForumChannel):
Promise<ThreadChannel[]>{
    const active = await board.threads.fetchActive();
    const archived = await board.threads.fetchArchived({ limit: 100 });

    return [...active.threads.values(), ...archived.threads.values()];
}

export async function fetchPostBody(post: ThreadChannel): Promise<string>
{
    const starter = await post.fetchStarterMessage().catch(() => null);

    return starter?.content ?? "";
}