import { Service } from './provider';

/**
 * 用来在一个容器实例内，唯一标识一个 Provider
 */
export type InjectToken = Service | Symbol | string
