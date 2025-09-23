import path from "node:path";
import fs from "fs";

export default class CssService {
  static getCssString(filepath: string) {
    try {
      const cssFilePath: string = path.resolve(process.cwd(), filepath);
      return fs.readFileSync(cssFilePath, "utf8");
    } catch (error) {
      throw error;
    }
  }
}
