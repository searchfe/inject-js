interface Option {
    modId?: string
}

/** molecule专用装饰器，在molecule业务模块内可以直接修饰入口组件 */
function molecule (target: Function): void
/** molecule通用装饰器，修饰非molecule业务模块内的组件，手动指定modId */
function molecule (option: Option): (target: any) => void

function molecule (targetOrOption: Function | Option) {
    if (typeof targetOrOption === 'function') {
        Reflect.defineMetadata('molecule:option', {}, targetOrOption);
        Reflect.defineMetadata('molecule:engine', 'MoleculeEngine', targetOrOption);
    } else {
        return function (target: any) {
            Reflect.defineMetadata('molecule:option', targetOrOption, target);
            Reflect.defineMetadata('molecule:engine', 'MoleculeEngine', target);
        };
    }
}

export {
    molecule
};
