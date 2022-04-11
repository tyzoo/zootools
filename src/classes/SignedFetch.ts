import { signedFetch } from "@decentraland/SignedFetch"

export class SignedFetchAPI {
    constructor(private baseURL: string){}
    request(method:"GET"|"POST"|"PUT"|"DELETE", path: string, body:any = {}){
      const _path = this.baseURL + path
      log(`API Request: ${method} ${_path}`)
      return new Promise((resolve, reject)=>{
        try {
          executeTask(async ()=>{
            let response
            switch(method){
              default:
              case "GET":
                response = await signedFetch(_path)
                break;
              case "PUT":
              case "POST":
              case "DELETE":
                response = await signedFetch(_path, {
                  headers: { "Content-Type": "application/json" },
                  method, 
                  body: JSON.stringify(body),
                })
                break;
            }
            let json: any
            if(response.text) json = JSON.parse(response.text)
            if(response.ok){
                log(`API Request Success: ${json.message}`)
                resolve(json)
            }else{
                log(`API Request Error: ${json.message}`)
                resolve(json)
            }
          })
        }catch(err:any){
          log(`API Request error occurred`, err)
          reject(false)
        }
      })
    }
}