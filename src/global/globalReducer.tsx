
import { Reducer } from 'react'
import { IGlobalState, GlobalActionTypes, GlobalActions, ROLES, IAuthUser, ILocStorage } from "./types";

export const initialAuthUser: IAuthUser = {
    nickName: '',
    name: '',
    email: '',
    color: 'blue',
    role: ROLES.VIEWER
}

// const initGlobalState: IGlobalState = {
//     dbp: null,
//     workspace: 'DEMO',
//     authUser: initialAuthUser,
//     isAuthenticated: false,
//     everLoggedIn: true,
//     canEdit: true,
//     isOwner: true,
//     isDarkMode: true,
//     variant: 'dark',
//     bg: 'dark',
//     loading: false,
//     allCategoryRows: new Map<string, ICategoryRow>(),
//     categoryRowsLoaded: undefined,
//     allGroupRows: new Map<string, IGroupRow>(),
//     groupRowsLoaded: undefined,
//     nodesReLoaded: false,
//     lastRouteVisited: '/categories',
// }

//let globalStateFromLocalStorage: IGlobalStateFromLocalStorage | undefined;

/*
const hasMissingProps = (): boolean => {
    let b = false;
    // const keys = Object.keys(globalStateFromLocalStorage!)
    // Object.keys(initGlobalState).forEach((prop: string) => {
    //     if (!keys.includes(prop)) {
    //         b = true;
    //         console.log('missing prop:', prop)
    //     }
    //     else if (prop === 'authUser') {
    //         const keys = Object.keys(globalStateFromLocalStorage!.authUser)
    //         Object.keys(initGlobalState.authUser).forEach((prop: string) => {
    //             if (!keys.includes(prop)) {
    //                 b = true;
    //                 //console.log('missing prop:', prop, ' try with SignOut')
    //                 alert('missing prop: ' + prop + ' try with SignOut')
    //             }
    //         })
    //     }
    // })
    return b;
} */

/*
if ('localStorage' in window) {
    // localStorage.removeItem('GLOBAL_STATE')
    const s = localStorage.getItem('GLOBAL_STATE');
    if (s !== null) {
        globalStateFromLocalStorage = JSON.parse(s);
        if (hasMissingProps()) {
            globalStateFromLocalStorage = undefined;
        }
        // else {
        //     const { authUser } = globalStateFromLocalStorage!;
        //     //authUser.userId = authUser.userId;
        //     console.log('===>>>globalStateFromLocalStorage', globalStateFromLocalStorage);
        // }
    }
}
*/

//export const initialGlobalState: IGlobalState = initGlobalState;
// if (globalStateFromLocalStorage) {
//     const { everLoggedIn, nickName, isDarkMode, variant, bg, lastRouteVisited } = globalStateFromLocalStorage;
//     initialGlobalState.everLoggedIn = everLoggedIn;
//     initialGlobalState.authUser.nickName = nickName;
//     initialGlobalState.isDarkMode = isDarkMode;
//     initialGlobalState.variant = variant;
//     initialGlobalState.bg = bg;
//     initialGlobalState.lastRouteVisited = lastRouteVisited;
// }

export const GlobalReducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const newState = reducer(state, action);
    const aTypesToStore = [
        GlobalActionTypes.AUTHENTICATE,
        GlobalActionTypes.DARK_MODE,
        GlobalActionTypes.LIGHT_MODE,
        GlobalActionTypes.UN_AUTHENTICATE,
        GlobalActionTypes.SET_LAST_ROUTE_VISITED
    ];
    if (aTypesToStore.includes(action.type)) {
        const { authUser, everLoggedIn, isDarkMode, variant, bg, lastRouteVisited } = newState;
        const { nickName } = authUser;
        const obj: ILocStorage = {
            nickName,
            everLoggedIn,
            isDarkMode,
            variant,
            bg,
            lastRouteVisited
        }
        localStorage.setItem('GLOBAL_STATE', JSON.stringify(obj));
    }

    console.log('==============================================================================')
    console.log('=========================' + action.type + '=======================================')
    console.log('==============================================================================')
    return newState;
}

const reducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const str = action.type
    switch (action.type) {

        case GlobalActionTypes.SET_LOADING:
            return {
                ...state,
                loading: true
            }

        case GlobalActionTypes.SET_FROM_LOCAL_STORAGE: {
            const { locStorage } = action.payload;
            return {
                ...state,
                ...locStorage
            }
        }

        case GlobalActionTypes.SET_ERROR: {
            const { error } = action.payload;
            return {
                ...state,
                error,
                loading: false
            };
        }

        case GlobalActionTypes.AUTHENTICATE: {
            console.log('GlobalActionTypes.AUTHENTICATE', action.payload)
            const { user } = action.payload;
            const { nickName, name, workspace } = user;
            return {
                ...state,
                authUser: {
                    nickName,
                    name,
                    email: '',
                    color: 'blue',
                    everLoggedIn: true,
                },
                workspace,
                canEdit: true, //user.parentRole !== ROLES.VIEWER,
                isOwner: true, //user.parentRole === ROLES.OWNER,
                isAuthenticated: true,
                everLoggedIn: true,
                error: undefined
            };
        }

        case GlobalActionTypes.SET_DBP: {
            const { dbp } = action.payload;
            return {
                ...state,
                dbp,
                loading: false
            };
        }

        case GlobalActionTypes.UN_AUTHENTICATE: {
            return {
                ...state,
                isAuthenticated: false,
                everLoggedIn: false,
                authUser: initialAuthUser,
                isOwner: false
            };
        }

        case GlobalActionTypes.LIGHT_MODE:
            return { ...state, isDarkMode: false, variant: 'light', bg: 'light' };

        case GlobalActionTypes.DARK_MODE:
            return { ...state, isDarkMode: true, variant: 'dark', bg: 'dark' };

        case GlobalActionTypes.SET_LAST_ROUTE_VISITED: {
            const { lastRouteVisited } = action.payload;
            return {
                ...state,
                lastRouteVisited
            };
        }

        case GlobalActionTypes.SET_ALL_CATEGORY_ROWS_GLOBAL: {
            const { allCategoryRows } = action.payload;
            return {
                ...state,
                allCategoryRowsGlobal: allCategoryRows,
                allCategoryRowsGlobalLoaded: Date.now()
            };
        }

        case GlobalActionTypes.SET_ALL_GROUP_ROWS: {
            const { allGroupRows } = action.payload;
            return {
                ...state,
                allGroupRows,
                allGroupRowsLoaded: Date.now()
            };
        }

        case GlobalActionTypes.SET_NODES_RELOADED: {
            return {
                ...state,
                nodesReLoaded: true
            };
        }


        default: {
            throw Error('Unknown action: ' + str);
        }
    }
};

