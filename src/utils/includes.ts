export function includes (arr: any[], token: any) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === token) {
            return true;
        }
    }
    return false;
}
