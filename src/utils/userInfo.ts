import { getCurrentRealm, Realm } from "@decentraland/EnvironmentAPI";
import { getUserData, UserData } from "@decentraland/Identity";

export let userInfo: {
    userData: UserData
    realm: Realm
}

export function updateUserInfo(){
    return new Promise((resolve)=>{
        executeTask(async () => {
            userInfo.userData = await getUserData();
            userInfo.realm = await getCurrentRealm();
            resolve()
        })
    })
}

updateUserInfo();