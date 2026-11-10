import assert from "node:assert/strict";
import test from "node:test";
import {
  parseProfileSettings,
  validateNickname,
} from "../src/utils/mySettings.ts";

test("프로필 닉네임 형식과 중복 상태를 구분한다", () => {
  assert.equal(validateNickname("새닉네임").tone, "success");
  assert.equal(validateNickname("도틀로").message, "이미 사용 중인 닉네임이에요");
  assert.equal(validateNickname("예빈!").message, "한글, 영문, 숫자만 입력할 수 있어요");
  assert.equal(validateNickname("한").valid, false);
});

test("저장된 프로필 데이터는 올바른 형식일 때만 복원한다", () => {
  const profile = JSON.stringify({
    nickname: "서희",
    email: "seohui@example.com",
    introduction: "여행을 좋아해요",
    avatar: "purple",
  });
  assert.equal(parseProfileSettings(profile)?.nickname, "서희");
  assert.equal(parseProfileSettings('{"nickname":"서희"}'), null);
  assert.equal(parseProfileSettings("broken"), null);
});
