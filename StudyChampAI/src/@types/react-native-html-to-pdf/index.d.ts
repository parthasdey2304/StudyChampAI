declare module "react-native-html-to-pdf" {

  interface RNHTMLtoPDFOptions {

    html: string;

    fileName?: string;

    directory?: string;

    width?: number;

    height?: number;

    padding?: number;

    bgColor?: string;

  }



  interface RNHTMLtoPDFResponse {

    filePath: string;

    base64?: string;

  }



  export default {

    convert(options: RNHTMLtoPDFOptions): Promise<RNHTMLtoPDFResponse>;

  }

}
