/** PartialLiteral */
export declare type PL = 'Partial';
/** RequiredLiteral */
export declare type RL = 'Required';
export declare type PartialOrRequired<T, F extends PL | RL> = {
    [P in keyof T]: F extends PL ? Partial<T[P]> : Required<T[P]>;
};
