/**
 * Web Serial API Helper for Arduino and ESP32 physical boards
 * Supported in Chrome, Chromium, Edge, Opera
 */

export interface SerialConnection {
  port: any;
  reader?: ReadableStreamDefaultReader<string>;
  writer?: WritableStreamDefaultWriter<string>;
  isConnected: boolean;
}

export async function requestAndConnectSerial(
  baudRate = 115200,
  onLineReceived: (line: string) => void,
  onStatusChange: (status: 'connected' | 'disconnected' | 'error', error?: string) => void
): Promise<{ disconnect: () => Promise<void>; send: (data: string) => Promise<void> } | null> {
  if (typeof window === 'undefined' || !('serial' in navigator)) {
    onStatusChange('error', 'Web Serial API is not supported in this browser. Use Chrome, Edge, or the Virtual Hardware Bench.');
    return null;
  }

  try {
    const navSerial = (navigator as any).serial;
    const port = await navSerial.requestPort();
    await port.open({ baudRate });

    onStatusChange('connected');

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();

    let buffer = '';

    // Read loop
    (async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.trim().length > 0) {
                onLineReceived(line.trim());
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('Serial read loop ended:', err);
      } finally {
        reader.releaseLock();
      }
    })();

    const send = async (data: string) => {
      if (!writer) return;
      await writer.write(data.endsWith('\n') ? data : data + '\n');
    };

    const disconnect = async () => {
      try {
        await reader.cancel();
        await readableStreamClosed.catch(() => {});
        await writer.close();
        await writableStreamClosed.catch(() => {});
        await port.close();
        onStatusChange('disconnected');
      } catch (err) {
        console.error('Error disconnecting port:', err);
        onStatusChange('disconnected');
      }
    };

    return { disconnect, send };
  } catch (err: any) {
    onStatusChange('error', err?.message || 'Failed to open serial port.');
    return null;
  }
}
