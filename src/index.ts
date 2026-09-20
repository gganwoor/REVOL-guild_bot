import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { CLUB_TYPES } from "./config.js";
import { env } from "./env.js";
import { fetchAllPosts, fetchPostBody } from "./recruit/fetchPosts.js";
import { parseRecruitPost } from "./recruit/parse.js";
import { watchApplications } from "./applications/watch.js";
import { addMember, countMembers, upsertClub, isHandled, markHandled, getClub } from "./db.js";
import { sendCard } from "./applications/card.js";
import { handleCardButtons } from "./applications/handle.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once(Events.ClientReady, async (ready) => {
    console.log(`${ready.user.tag} 로그인 완료`);

    const board = await ready.channels.fetch(env.boardForumId);

    if(board?.type !== ChannelType.GuildForum){
        throw new Error("BOARD_FORUM_ID가 포럼 채널이 아닙니다.");
    }

    const posts = await fetchAllPosts(board);
    console.log(`게시판 "${board.name}" 포스트 ${posts.length}개`);

    for(const post of posts){
        if(env.ignoredPostIds.includes(post.id)){
            console.log(`   [제외] ${post.name}`);
            continue;
        }

        const body = await fetchPostBody(post);
        const result = parseRecruitPost(post.name, body);

        if(!result.ok){
            console.log(`   [실패] ${post.name} - ${result.reason}`);
            continue;
        }

        const { type, name, leaderId } = result.post;

        upsertClub({ postId: post.id, name, type, leaderId });
        addMember(post.id, leaderId);

        console.log(
            `   [인식] ${name} . ${CLUB_TYPES[type].label} . ${countMembers(post.id)}/${CLUB_TYPES[type].minMembers}명`,
        );
    }
});

watchApplications(client, async (application) => {
    if(isHandled(application.messageId)) return;

    const club = getClub(application.postId);

    if(club?.leader_id === application.userId) {
        console.log(`[제외] 길드장 본인의 댓글 - ${application.postName}`);
        return;
    } 

    const channel = await client.channels.fetch(env.staffChannelId);

    if(channel?.type !== ChannelType.GuildText){
        console.error("STAFF_CHANNEL_ID가 텍스트 채널이 아닙니다.");
        return;
    }

    await sendCard(channel, application);
    markHandled(application.messageId, application.postId, application.userId);

    console.log(`[카드] ${application.postName} . ${application.userId}`);
});

handleCardButtons(client);

await client.login(env.token);