import { describe, expect, it } from "vitest";
import { parseRecruitPost } from "./parse.js";

const STUDY_BODY = `
### 💬 신청 안내
* **길드장:** <@123456789012345678> (홍길동)
* **신청 방법:** 포스트 하단에 신청 댓글을 남겨주세요
`;

describe("parseRecruitPost", () => {
  it("스터디 모집글을 읽는다", () => {
    const result = parseRecruitPost("✏️ [200 OK] 길드원을 모집합니다!", STUDY_BODY);

    expect(result).toEqual({
      ok: true,
      post: { type: "study", name: "200 OK", leaderId: "123456789012345678" },
    });
  });

  it("클럽 모집글을 읽는다", () => {
    const result = parseRecruitPost("🎮 [보드게임] 같이 하실 분!", STUDY_BODY);

    expect(result).toEqual({
      ok: true,
      post: { type: "club", name: "보드게임", leaderId: "123456789012345678" },
    });
  });

  it("이모지 뒤 문자가 없어도 인식한다", () => {
    const result = parseRecruitPost("✏ [200 OK] 모집", STUDY_BODY);

    expect(result.ok).toBe(true);
  });

  it("스터디장 표기도 인식한다", () => {
    const body = "* **스터디장:** <@123456789012345678> (홍길동)";
    const result = parseRecruitPost("✏️ [200 OK] 모집", body);

    expect(result.ok).toBe(true);
  });

  it("이모지가 없으면 실패한다", () => {
    const result = parseRecruitPost("[가이드라인] 길드 안내", STUDY_BODY);

    expect(result.ok).toBe(false);
  });

  it("길드장 멘션이 없으면 실패한다", () => {
    const result = parseRecruitPost("✏️ [200 OK] 모집", "* **길드장:** 홍길동");

    expect(result.ok).toBe(false);
  });
});