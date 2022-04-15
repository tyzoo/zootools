import { getUserData, UserData } from "@decentraland/Identity";
import { getCurrentRealm, Realm } from "@decentraland/EnvironmentAPI";

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

executeTask(async () =>{
    await updateUserInfo();
})