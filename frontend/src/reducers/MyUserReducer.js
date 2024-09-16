const MyUserReducer = (currentState, action) => {
    switch (action.type) {
        case 'login':
            return action.payload;
        case 'logout':
            return null;
        default:
            return currentState;
    }
};

export default MyUserReducer;
