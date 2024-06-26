const INIT_STATE = {
    isLoaderCount: 0,
    isLoadingCount: 0,
    isLoading: false,
};

const reducer = (state = INIT_STATE, action) => {

    switch (action.type) {

        case "TOGGLE_LOADER": {
            var counter = state.isLoaderCount;
            if (action.payload) {
                counter++;
            } else {
                counter--;
            }
            if (counter <= 0) {
                return {
                   ...state,
                    isLoaderCount: 0,
                    isLoading: false
                };
            } else {
                return {
                   ...state,
                    isLoaderCount: counter,
                    isLoading: true
                };
            }
        }

        case "TOGGLE_LOADER_CLEAR": {
            console.log("clear");
            return {
               ...state,
                isLoaderCount: 0,
                isLoading: false
            };
        }

        case "TOGGLE_LOADER_MULTI": {
            var count = state.isLoadingCount;
            if (action.payload) {
                count++;
            } else {
                count--;
            }
            if (count <= 0) {
                return {
                   ...state,
                    isLoadingCount: 0,
                    isLoading: false
                };
            } else {
                return {
                   ...state,
                    isLoadingCount: count,
                    isLoading: true
                };
            }
        }

        default:
            return state;

    }
};

export default reducer;
