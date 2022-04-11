export function urn(str: string): string {
    const urnPrefix = 'urn:decentraland:matic:collections-v2:';
    return urnPrefix + str;
}