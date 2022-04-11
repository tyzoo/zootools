import {
    getCurrentRealm,
    isPreviewMode,
    Realm,
} from '@decentraland/EnvironmentAPI';
import { getUserData, UserData } from '@decentraland/Identity';
import { getProvider, Provider } from '@decentraland/web3-provider';

export class DCLConnectUserInfo {
    constructor() {
        // try { onRealmChangedObservable.add((realmChange) => {
        //         log("PLAYER CHANGED ISLAND TO ", realmChange.room);
        //         executeTask(async () => {
        //             const realm = await getCurrentRealm();
        //             if(realm) this.realm = realm;
        //         });
        // }); }catch{ }
    }

    userData: UserData | null = null;
    realm: Realm | undefined | null = null;
    provider: Provider | undefined | null = null;
    previewMode: boolean | null = null;
    address: string | undefined = undefined;
    initialized: Promise<void> | null = null

    fetchUser() {
        if(!this.initialized){
            this.initialized = new Promise<void>((resolve, reject) => {
                executeTask(async () => {
                    this.userData = await this.getUserData();
                    this.address = this.userData?.userId;
                    this.realm = await this.getRealm();
                    this.provider = await this.getProvider();
                    this.previewMode = await this.getPreviewMode();
                    resolve();
                });
            });
        }
    }

    getUserData(): Promise<UserData | null> {
        if (this.userData === null) {
            return executeTask(async () => {
                const userData = await getUserData();
                if (userData) {
                    this.userData = userData;
                    this.address = this.userData.userId;
                    return userData;
                } else {
                    return null;
                }
            });
        } else {
            return new Promise<UserData>((resolve, reject) => {
                resolve(this.userData!);
            });
        }
    }

    getRealm(): Promise<Realm | null> {
        if (this.realm === null) {
            return executeTask(async () => {
                const realm = await getCurrentRealm();
                if (realm) {
                    this.realm = realm;
                    return realm;
                } else {
                    return null;
                }
            });
        } else {
            return new Promise<Realm>((resolve, reject) => {
                resolve(this.realm!);
            });
        }
    }

    getProvider(): Promise<Provider> {
        if (this.provider === null) {
            return executeTask(async () => {
                const provider: Provider | null = await getProvider();
                this.provider = provider;
                return provider;
            });
        } else {
            return new Promise<Provider>((resolve, reject) => {
                resolve(this.provider!);
            });
        }
    }

    getPreviewMode(): Promise<boolean | null> {
        if (this.previewMode === null) {
            return executeTask(async () => {
                this.previewMode = await isPreviewMode();
                return this.previewMode;
            });
        } else {
            return new Promise<boolean>((resolve, reject) => {
                resolve(this.previewMode!);
            });
        }
    }
}