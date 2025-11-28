declare module 'ofx-js' {
  export default class OFXParser {
    parse(ofxString: string, callback: (error: Error | null, data: any) => void): void;
  }
}
