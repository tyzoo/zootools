//added typescript to these examples

//https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
export function b2a(a:string): string {
    var c: number, 
    d: number, 
    e: number, 
    f: number, 
    g: number, 
    h: number, 
    i: number, 
    j: number, 
    o: number, 
    b: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
    k: number = 0, 
    l: number = 0, 
    m: string = "", 
    n: any[] = [];
    if (!a) return a;
    do c = a.charCodeAt(k++), d = a.charCodeAt(k++), e = a.charCodeAt(k++), j = c << 16 | d << 8 | e, 
    f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < a.length);
    return m = n.join(""), o = a.length % 3, (o ? m.slice(0, o - 3) :m) + "===".slice(o || 3);
}

export function a2b(a:string): string {
    var b: number, 
    c: number, 
    d: number, 
    e: any = {}, 
    f: number = 0, 
    g: number = 0, 
    h: string = "", 
    i: (...codes: number[]) => string = String.fromCharCode, 
    j: number = a.length;
    for (b = 0; 64 > b; b++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b)] = b;
    for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
    return h;
}
/**
 * 
 *  var str1ng="http://www.whak.ca/packer/", encoded=b2a(str1ng), decoded=a2b(encoded);
    alert(encoded+"\n"+decoded);
 * https://stackoverflow.com/a/38552302
 * @param  {String} token The JWT
 * @return {Object}       The decoded payload
 */
export function parse(token: string){
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(a2b(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}