import RootReducer from './reducers/RootReducer';
import { createStore } from 'redux';
import { persistStore } from 'redux-persist';
const reduxStore = () => {
    const store = createStore(RootReducer); /// hôm sau sẽ thêm midđleware vào đây
    const persistor = persistStore(store);

    return { store, persistor };
};

export default reduxStore;
