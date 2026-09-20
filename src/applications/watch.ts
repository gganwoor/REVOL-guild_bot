import { Events, type Client, type Message } from "discord.js";
import { env } from "../env.js";

export interface Application {
    postId: string;
    postName: string;
    messageId: string;
    userId: string;
    content: string;
}

async function toApplication(message: Message): Promise<Application | null>{
    if(message.author.bot) return null;

    const post = message.channel;

    if(!post.isThread()) return null;
    if(post.parentId !== env.boardForumId) return null;
    if(env.ignoredPostIds.includes(post.id)) return null;

    if(message.id === post.id) return null;

    return{
        postId: post.id,
        postName: post.name,
        messageId: message.id,
        userId: message.author.id,
        content: message.content.trim(),
    };
}

export function watchApplications(
    client: Client,
    onApplication: (application: Application) => Promise<void>,
): void {
    client.on(Events.MessageCreate, async (message) => {
        const application = await toApplication(message);

        if(!application) return;

        await onApplication(application);
    });
}