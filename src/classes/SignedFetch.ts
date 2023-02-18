export class SignedFetchAPI {
    constructor(private baseURL: string, private signedFetch: (url: string, init?: any) => Promise<any>){}
    public request(method:"GET"|"POST"|"PUT"|"DELETE", path: string, body:any = {}): Promise<unknown>{
      const _path = this.baseURL + path
      this.log(`API Request: ${method} ${_path}`)
      return new Promise((resolve, reject)=>{
        try {
          executeTask(async ()=>{
            let response: any;
            switch(method){
              default:
              case "GET":
                response = await this.signedFetch(_path);
                break;
              case "PUT":
              case "POST":
              case "DELETE":
                response = await this.signedFetch(_path, {
                  headers: { "Content-Type": "application/json" },
                  method, 
                  body: JSON.stringify(body),
                });
                break;
            }
            let json: any;
            if(response.text) json = JSON.parse(response.text);
            if(response.ok){
                this.log(`API Request Success: ${json.message}`);
                resolve(json);
            }else{
                const m = `API Response was not ok`;
                this.log(m);
                resolve(json ? json : m);
            }
          })
        }catch(err:any){
          this.log(`API Request error occurred`, err);
          reject(err);
        }
      })
    }
    private log(...props:any){ log('[ 🦁 ZooTools 🐒 ]', '[ SignedFetch ]', ...props)}
}