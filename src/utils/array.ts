export function includes<T> (arr: T[], val: T): boolean {
    for (const item of arr) if (item === val) return true;
    return false;
}
