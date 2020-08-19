export { Reflect } from 'reflect-metadata';

declare module 'smarty' {
  export class Smarty {
      fetch(path: string): string
      assign(data: any): undefined
  }
}
