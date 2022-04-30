import { UserInfo } from "../classes/UserInfo";

export let userInfo: UserInfo | undefined

export const initUserInfo = (): UserInfo => {
    userInfo = new UserInfo();
    return userInfo;
}