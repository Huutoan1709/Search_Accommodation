import AuthReducer from './AuthReducer';
import MyUserReducer from './MyUserReducer';
import PostReducer from './PostReducer';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';

import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const commomConfig = {
    storage,
    stateRecociler: autoMergeLevel2,
};

const authConfig = {
    ...commomConfig,
    key: 'auth',
    whitelist: ['isLogin', 'token'],
};

const RootReducer = combineReducers({
    auth: persistReducer(authConfig, AuthReducer),
    user: MyUserReducer,
});

export default RootReducer;
