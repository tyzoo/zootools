import { UserInfo } from "../classes/UserInfo";

export let userInfo: UserInfo | undefined

export const initUserInfo = (): UserInfo => {
    if(userInfo) return userInfo;
    userInfo = new UserInfo();
    return userInfo;
}