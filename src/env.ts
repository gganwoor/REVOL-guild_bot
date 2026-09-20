function required(key: string): string {
    const value = process.env[key]?.trim();

    if(!value){
        throw new Error(`환경 변수 ${key}가 비어 있습니다.`);
    }

    return value;
}

function idList(key: string): string[]{
    return (process.env[key] ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

export const env = {
    token: required("DISCORD_TOKEN"),
    serverId: required("SERVER_ID"),
    boardForumId: required("BOARD_FORUM_ID"),
    ignoredPostIds: idList("IGNORED_POST_IDS"),
    staffChannelId: required("STAFF_CHANNEL_ID"),
    staffRoleId: required("STAFF_ROLE_ID"),
} as const;