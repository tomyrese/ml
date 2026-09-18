export interface ParsedPairingData {
  protocol: string;
  host: string;
  port: number;
  pairCode: string;
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export function parsePairingPayload(payload: string): ParsedPairingData | null {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  const parts = payload.trim().split('|');
  if (parts.length !== 4) {
    return null;
  }

  const [protocol, host, portStr, pairCode] = parts;

  if (protocol !== 'P1') {
    return null;
  }

  const trimmedHost = host.trim();
  if (!IPV4_REGEX.test(trimmedHost) && trimmedHost !== 'localhost') {
    return null;
  }

  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    return null;
  }

  const trimmedCode = pairCode.trim().toUpperCase();
  if (trimmedCode.length < 4 || trimmedCode.length > 12) {
    return null;
  }

  return {
    protocol,
    host: trimmedHost,
    port,
    pairCode: trimmedCode,
  };
}
