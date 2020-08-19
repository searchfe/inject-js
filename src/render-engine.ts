import { Data } from './data';

interface RenderReturnData {
  html: string;
  css: string;
  cost: number; // 渲染耗时
  [key: string]: any;
}

export abstract class RenderEngine {
  abstract render (path: string, data: Data): string;
  abstract render (path: string, data: Data, needObject: boolean): RenderReturnData;
  abstract runFilter(name: string, data: any): string;
}
